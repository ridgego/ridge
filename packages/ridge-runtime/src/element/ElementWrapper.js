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
    this.instancePropBinding = {}

    // Wrapper元素的样式数据
    this.stylePropValue = {}
    // Wrapper元素的绑定样式数据
    this.stylePropBind = {}

    // 组件的scope值数据
    this.scopeVariableValues = {}

    this.page = page
    this.el.elementWrapper = this
  }

  setScopeVariableValues (scopeVariableValues) {
    this.scopeVariableValues = scopeVariableValues
  }

  async initialize () {
    this.el.className = 'ridge-element'
    this.el.setAttribute('snappable', 'true')

    if (this.el.dataset.props) {
      this.instancePropConfig = JSON.parse(this.el.dataset.props)
    }
    if (this.el.dataset.propsEx) {
      this.instancePropBinding = JSON.parse(this.el.dataset.propsEx)
    }

    if (this.el.dataset.styleEx) {
      this.instancePropConfig = JSON.parse(this.el.dataset.styleEx)
    }

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
    // 设置回写属性值的事件
    this.propertyWriteBackEvents = {}

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
        this.propertyWriteBackEvents.input = 'value'
      }

      if (prop.input === true) {
        // input相当于v-model，只能设置到一个属性上面
        const eventName = 'set' + prop.name.substr(0, 1).toUpperCase() + prop.name.substr(1)

        // 当双向绑定时， 获取动态绑定部分配置的属性值
        this.instancePropConfig[eventName] = val => {
          this.emit(eventName, val)
        }
        this.propertyWriteBackEvents[eventName] = prop.name
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

    // 处理组件双向绑定
    // if (this.interactHandler) {
    //   this.interactHandler.attachInteractTo(this)
    // }

    // 子节点的fcView也同时放入
    if (this.childrenFcViews && this.childrenFcViews.length) {
      this.instancePropConfig.childrenViews = this.childrenFcViews
      this.instancePropConfig.$$childrenViews = this.childrenFcViews
      this.childrenFcViews.forEach(fcView => {
        fcView.setScopeVariables(this.scopeVariables)
      })
    }

    // 事件类属性写入，DOM初始化后事件才能挂到源头
    for (const event of this.componentDefinition.events || []) {
      this.instancePropConfig[event.name] = (...args) => {
        this.emit(event.name, ...args)
      }
    }

    // 检查未在组件定义但是动态绑定上的交互列表
    // for (const interaction of (this.fcInstanceConfig.in || [])) {
    //   if (!this.instancePropConfig[interaction.event.name]) {
    //     this.instancePropConfig[interaction.event.name] = (...args) => {
    //       this.emit(interaction.event.name, ...args)
    //     }
    //   }
    // }

    // 写入插槽信息
    // for (const slotProp in this.slotFcViews) {
    //   this.instancePropConfig[slotProp] = this.slotFcViews[slotProp]
    // }
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

  updateStyle (style) {
    // 合并更新值
    Object.assign(this.stylePropValue, style)

    this.el.style.width = this.stylePropValue.width ? (this.stylePropValue.width + 'px') : ''
    this.el.style.height = this.stylePropValue.height ? (this.stylePropValue.height + 'px') : ''
    this.el.style.position = this.stylePropValue.position
    if (this.stylePropValue.position === 'absolute') {
      this.el.style.transform = `translate(${this.stylePropValue.x}px, ${this.stylePropValue.y}px)`
    } else {
      this.el.style.transform = ''
    }

    this.el.dataset.style = JSON.stringify(this.stylePropValue)
  }

  updateProperties (props) {
    // 合并更新值
    const newProps = Object.assign({
      elementWrapper: this
    }, this.instancePropConfig, props)

    if (this.renderer) {
      try {
        log('updateProps', this.id, newProps)
        this.renderer.updateProps(newProps)
      } catch (e) {
        log('用属性渲染组件出错', this.id, newProps, this)
      }
    } else {
      log('updateProps umounted', this.id, newProps)
    }
  }

  /**
     * 获取当前组件可见的上下文变量信息
     */
  getVariableContext () {
    return Object.assign({},
      this.page.getVariableValues(),
      this.scopeVariableValues
    )
  }

  forceUpdate () {
    const updated = {}
    Object.assign(updated, this.instancePropConfig)

    for (const propBindKey of Object.keys(this.instancePropBinding)) {
      updated[propBindKey] = template(this.instancePropBinding[propBindKey], this.getVariableContext())
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

    Object.assign(this.stylePropValue, style)
    return this.stylePropValue
  }

  getName () {
    return this.el.dataset.name
  }

  getPropsValue () {
    return this.instancePropConfig
  }

  getPropsBinding () {
    return this.instancePropBinding
  }

  getStyleBinding () {
    return this.stylePropBind
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
    for (const key of Object.keys(field)) {
      if (key === 'name') {
        this.el.dataset.name = field[key]
        continue
      }
      const keySplited = key.split('.')

      if (keySplited[0] === 'props') {
        this.updateProperties({
          [keySplited[1]]: field[key]
        })
        this.el.dataset.props = JSON.stringify(this.instancePropConfig)
      }

      if (keySplited[0] === 'style') {
        this.updateStyle({
          [keySplited[1]]: field[key]
        })
      }

      if (keySplited[0] === 'ex') {
        if (keySplited[1] === 'props') {
          this.updatePropertiesExpression({
            [keySplited[2]]: field[key]
          })
          this.el.dataset.propsEx = JSON.stringify(this.instancePropBinding)
        }
        if (keySplited[1] === 'style') {
          this.updateStyleExpression({
            [keySplited[2]]: field[key]
          })
          this.el.dataset.styleEx = JSON.stringify(this.stylePropBind)
        }
      }
    }
    this.forceUpdate()
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

  eventConfigUpdate () {

  }
}

export default ElementWrapper
