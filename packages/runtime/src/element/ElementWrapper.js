import debug from 'debug'
import ReactRenderer from '../render/ReactRenderer'
import template from '../template'
const log = debug('ridge:el-wrapper')

export const STATUS_DROPPABLE = 'droppable'
export const STATUS_LOADING = 'loading'

export const ATTR_DROPPABLE = 'droppable'

/**
 * 组件封装类
 */
class ElementWrapper {
  constructor ({
    el,
    page
  }) {
    this.el = el

    this.id = el.getAttribute('ridge-id')

    // 组件配置的属性静态值
    this.instancePropConfig = {}
    // 组件配置的属性动态值
    this.instancePropConfigEx = {}
    // Wrapper元素的样式数据
    this.instanceStyle = {}
    // Wrapper元素的绑定样式数据
    this.instanceStyleEx = {}

    // 事件处理
    this.eventActionsConfig = {}
    // 组件的scope值数据
    this.scopeVariableValues = {}

    this.page = page
    this.el.elementWrapper = this
  }

  async initialize () {
    this.el.className = 'ridge-element'
    this.el.setAttribute('snappable', 'true')

    const config = JSON.parse(this.el.dataset.config || '{}')

    this.instancePropConfig = config.props || {}
    this.instancePropConfigEx = config.propsEx || {}
    this.instanceStyle = config.style || {}
    this.instanceStyleEx = config.styleEx || {}
    this.eventActionsConfig = config.events || {}

    this.componentPath = this.el.getAttribute('component-path')

    this.componentDefinition = await this.loadComponentDefinition()

    if (this.componentDefinition) {
      if (this.componentDefinition.editorFeatures) {
        if (this.componentDefinition.editorFeatures.droppable) {
          this.el.setAttribute(ATTR_DROPPABLE, '1')
        }
      }
      this.initPropsAndEvents()
      this.mount(this.el)
      this.removeStatus('loading')
    }
  }

  setWrapperStyle (style) {
    Object.assign(this.el.style, style)
  }

  async loadAndInitialize (el) {
    this.el.className = 'ridge-element'
    this.el.setAttribute('id', 'el-' + this.id)

    if (this.componentConfig.position) {
      this.el.style.position = 'absolute'
      this.el.style.width = this.componentConfig.position.width + 'px'
      this.el.style.height = this.componentConfig.position.height + 'px'
      this.el.style.transform = `translate(${this.componentConfig.position.x}px, ${this.componentConfig.position.y}px)`
    }

    await this.loadComponentDefinition()

    if (this.componentDefinition) {
      if (this.componentDefinition.editorFeatures) {
        if (this.componentDefinition.editorFeatures.droppable) {
          this.el.setAttribute(ATTR_DROPPABLE, '1')
        }
      }
    }
    this.initPropsAndEvents()
    this.mount(el ?? this.el)
    this.removeStatus('loading')
  }

  async loadComponentDefinition () {
    // 加载组件定义信息
    if (this.componentPath) {
      this.setStatus('loading')
      const componentDefinition = await this.page.ridge.loadComponent(this.componentPath)

      if (!componentDefinition || !componentDefinition.component) {
        log('加载图元失败: 未获取组件', this.componentPath)
        return null
      }

      // 枚举组件定义属性，加载相关的字体资源
      for (const prop of componentDefinition.props || []) {
        // 字体类型属性，并且指定了值
        if (prop.control === 'font-dropdown' && this.instancePropConfig[prop.name]) {
          log('加载字体', this.instancePropConfig[prop.name])
          await this.loader.loadFont(null, this.instancePropConfig[prop.name])
        }
      }
      this.setStatus('Preparing')

      try {
        this.context && this.context.emit('component-loaded', this)
      } catch (e) {
        //
      }
      return componentDefinition
    }
  }

  /**
   * 初始化组件属性、事件
   */
  initPropsAndEvents () {
    // 枚举、处理所有属性定义
    for (const prop of this.componentDefinition.props || []) {
      // 默认值次序：  控件实例化给的默认值 -> 组态化定义的默认值 -> 前端组件的默认值 (这个不给就用默认值了)
      if (this.instancePropConfig[prop.name] == null && prop.value != null) {
        this.instancePropConfig[prop.name] = prop.value
      }

      // 处理属性的input情况 类似 vue的 v-model
      if (prop.name === 'value') {
        this.instancePropConfig.input = val => {
          this.emit('input', val)
        }
      }

      if (prop.input === true) {
        // input相当于v-model，只能设置到一个属性上面
        const eventName = 'set' + prop.name.substr(0, 1).toUpperCase() + prop.name.substr(1)

        // 当双向绑定时， 获取动态绑定部分配置的属性值
        this.instancePropConfig[eventName] = val => {
          this.emit(eventName, val)
        }
      }
      // 属性进行动态绑定的情况 （动态属性） 这里只进行一次计算， 动态属性更新时会调用update进行更新
      // eslint-disable-next-line max-len
      // if (this.fcInstanceConfig.reactiveProps && this.fcInstanceConfig.reactiveProps[prop.name]) {
      //   const context = Object.assign({}, this.contextVariables, {
      //     $scope: this.scopeVariables
      //   })

      //   try {
      //     this.instancePropConfig[prop.name] = template(this.fcInstanceConfig.reactiveProps[prop.name], context)
      //   } catch (e) {
      //     this.instancePropConfig[prop.name] = null
      //   }
      // }
    }

    // 事件类属性写入，DOM初始化后事件才能挂到源头
    for (const event of this.componentDefinition.events || []) {
      this.instancePropConfig[event.name] = (...args) => {
        this.emit(event.name, ...args)
      }
    }
    // 子节点的fcView也同时放入
    if (this.childrenFcViews && this.childrenFcViews.length) {
      this.instancePropConfig.childrenViews = this.childrenFcViews
      this.childrenFcViews.forEach(fcView => {
        fcView.setScopeVariables(this.scopeVariables)
      })
    }

    this.editorFeatures = this.componentDefinition.editorFeatures ?? {}

    // try {
    //   Object.values(this.decorators).forEach(decorator => decorator.initPropEvents(this))
    // } catch (e) {
    //   console.error('Decorator initPropEvents Error', e)
    // }
  }

  /**
     * 执行组件初次加载 mount到具体DOM元素
     */
  mount (el) {
    // 检测到需要为DOM绑定事件，则在此处绑定
    // !!!! 事件的回调已经统一注册到 this.eventCallbacks 之中了， 当emit时按名称会调用事件
    // if (this.domEvents.length) {
    //   for (const eventName of this.domEvents) {
    //     this.attachElEvent(el, eventName)
    //   }
    // }

    try {
      // 更新所有动态属性
      this.renderer = new ReactRenderer(this.componentDefinition.component, this.el, this.instancePropConfig)
      // this.context.emit('mouted', this)
    } catch (e) {
      console.error(e)
    }
  }

  forceUpdateStyle () {
    this.el.style.width = this.instanceStyle.width ? (this.instanceStyle.width + 'px') : ''
    this.el.style.height = this.instanceStyle.height ? (this.instanceStyle.height + 'px') : ''
    this.el.style.position = this.instanceStyle.position
    if (this.instanceStyle.position === 'absolute') {
      this.el.style.transform = `translate(${this.instanceStyle.x}px, ${this.instanceStyle.y}px)`
    } else {
      this.el.style.transform = ''
    }

    if (Object.keys(this.instanceStyleEx).length) {
      if (this.instanceStyleEx.width) {
        this.el.style.width = template(this.instanceStyleEx.width, this.getVariableContext()) + 'px'
      }
    }
  }

  updateProperties (props) {
    Object.assign(this.instancePropConfig, props)
    if (this.renderer) {
      try {
        log('updateProps', this.id, this.instancePropConfig)

        this.renderer.updateProps(Object.assign({
          elementWrapper: this
        }, this.instancePropConfig))
      } catch (e) {
        log('用属性渲染组件出错', this.id, this.instancePropConfig, this)
      }
    } else {
      log('updateProps umounted', this.id, this.instancePropConfig)
    }
  }

  setScopeVariableValues (scopeVariableValues) {
    this.scopeVariableValues = scopeVariableValues
  }

  getScopeVariableValues () {
    if (this.parent) {
      return Object.assign(this.parent.getScopeVariableValues(), this.scopeVariableValues)
    } else {
      return this.scopeVariableValues
    }
  }

  /**
     * 获取当前组件可见的上下文变量信息
     */
  getVariableContext () {
    return Object.assign({},
      this.page.getVariableValues(),
      this.getScopeVariableValues()
    )
  }

  /**
   * 强制重新计算属性并更新组件显示
   */
  forceUpdate () {
    const updated = {}
    Object.assign(updated, this.instancePropConfig)

    for (const propBindKey of Object.keys(this.instancePropConfigEx)) {
      updated[propBindKey] = template(this.instancePropConfigEx[propBindKey], this.getVariableContext())
    }
    this.updateProperties(updated)
  }

  updatePropertiesExpression (propsEx) {
    // 合并更新值
    Object.assign(this.instancePropBinding, propsEx)
  }

  updateStyleExpression (styleEx) {
    // 合并更新值
    Object.assign(this.stylePropBind, styleEx)
  }

  invoke (method, args) {
    this.renderer.invoke(method, args)
  }

  emit (eventName, payload) {
    console.log('emit', eventName, payload)

    if (this.eventActionsConfig[eventName]) {
      for (const action of this.eventActionsConfig[eventName]) {
        if (action.name === 'setvar') {
          try {
            const newVariableValue = template(action.value, this.getVariableContext())
            this.page.updatePageVariableValue(action.target, newVariableValue)
          } catch (e) {
            log('Event Action[setvar] Error', e)
          }
        }
      }
    }
  }

  getCreateChildElement (name) {}

  /**
   * 获取封装层样式，包括  x/y/width/height/visible/rotate
   * @returns
   */
  getStyle () {
    const style = {
    }
    if (this.el.style.transform) {
      const matched = this.el.style.transform.match(/[0-9.]+/g)
      style.x = parseInt(matched[0])
      style.y = parseInt(matched[1])
      style.position = 'absolute'
    } else {
      style.x = 0
      style.y = 0
    }
    style.width = parseInt(this.el.style.width)
    style.height = parseInt(this.el.style.height)

    Object.assign(this.instanceStyle, style)
    return this.instanceStyle
  }

  getName () {
    return this.el.dataset.name
  }

  getPropsValue () {
    return this.instancePropConfig
  }

  getPropsBinding () {
    return this.instancePropConfigEx
  }

  getStyleBinding () {
    return this.instanceStyleEx
  }

  getEventActionsConfig () {
    return this.eventActionsConfig
  }

  setStatus (status) {
    if (status === STATUS_DROPPABLE) {
      this.el.style.border = '2px solid #12e'
    }
  }

  removeStatus (status) {
    if (status === STATUS_DROPPABLE) {
      this.el.style.border = ''
    }
  }

  /**
     * 为DOM元素绑定基础的交互事件
     * @param {*} el
     * @param {*} eventName
     */
  attachElEvent (el, eventName) {
    el[eventName] = event => {
      try {
        this.emit(eventName, this.componentConfig)
        event.stopPropagation()
      } catch (e) {
        console.error('事件处理异常', e)
      }
      return false
    }
  }

  /** --------------------------------------
   * Config Only
   **/

  /**
   * 组件配置信息发生改变，通过编辑器配置面板传入
   * @param {*} values
   * @param {*} field
   */
  propConfigUpdate (values, field) {
    for (const keyPath of Object.keys(field)) {
      const [type, key] = keyPath.split('.')

      if (type === 'props') {
        Object.assign(this.instancePropConfig, {
          [key]: field[keyPath]
        })
      }
      if (type === 'style') {
        Object.assign(this.instanceStyle, {
          [key]: field[keyPath]
        })
      }
      if (type === 'propsEx') {
        Object.assign(this.instancePropConfigEx, {
          [key]: field[keyPath]
        })
      }
      if (type === 'styleEx') {
        Object.assign(this.instanceStyleEx, {
          [key]: field[keyPath]
        })
      }
    }

    this.el.dataset.config = JSON.stringify({
      props: this.instancePropConfig,
      style: this.instanceStyle,
      events: this.eventActionsConfig,
      styleEx: this.instanceStyleEx,
      propsEx: this.instancePropConfigEx
    })
    this.forceUpdateStyle()
    this.forceUpdate()
  }

  eventsConfigUpdate (values, field) {
    this.el.dataset.events = JSON.stringify(values)
  }

  getPropConfigValues () {
    return {
      name: this.el.dataset.name,
      props: this.getPropsValue(),
      style: this.getStyle(),
      ex: {
        props: this.getPropsBinding(),
        style: this.getStyleBinding()
      }
    }
  }

  eventConfigUpdate (values, update) {
    Object.assign(this.eventActionsConfig, values.event)
    this.el.dataset.config = JSON.stringify({
      props: this.instancePropConfig,
      style: this.instanceStyle,
      events: this.eventActionsConfig,
      styleEx: this.instanceStyleEx,
      propsEx: this.instancePropConfigEx
    })
  }
}

export default ElementWrapper
