import debug from 'debug'
import { times } from 'lodash'
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
    config,
    pageManager
  }) {
    this.config = config
    this.id = config.id
    this.pageManager = pageManager
    this.slot = config.slot
    this.parent = config.parent
    this.order = config.order

    // 给组件注入的属性值
    this.properties = {}
    this.isEdit = pageManager.isEdit
    this.initialize()
  }

  isRoot () {
    return this.slot == null && this.parent == null
  }

  initialize () {
    const { config } = this
    // 组件配置的属性静态值
    this.instancePropConfig = config.props || {}
    // 组件配置的属性动态值
    this.instancePropConfigEx = config.propsEx || {}
    // Wrapper元素的样式数据
    this.instanceStyle = config.style || {}
    // Wrapper元素的绑定样式数据
    this.instanceStyleEx = config.styleEx || {}
    // 事件处理配置
    this.eventActionsConfig = config.events || {}

    // 组件的scope值数据
    this.scopeVariableValues = {}
    this.componentPath = config.path

    Object.assign(this.properties, this.instancePropConfig)
  }

  /**
   * 加载组件代码、按代码初始化属性
   */
  async preload () {
    this.setStatus('Loading')
    this.componentDefinition = await this.loadComponentDefinition()
    if (this.componentDefinition) {
      this.initPropsAndEvents()
      this.removeStatus('Loading')
      this.preloaded = true
    } else {
      this.setStatus('Error')
    }
  }

  fromJSON () {
  }

  toJSON () {
    return {
      id: this.id,
      path: this.componentPath,
      config: {
        props: this.instancePropConfig,
        propsEx: this.instancePropConfigEx,
        style: this.instanceStyle,
        styleEx: this.instanceStyleEx,
        events: this.eventActionsConfig
      },
      children: [],
    }
  }

  async loadComponentDefinition () {
    // 加载组件定义信息
    if (this.componentPath) {
      const componentDefinition = await this.pageManager.ridge.loadComponent(this.componentPath)

      if (!componentDefinition || !componentDefinition.component) {
        log('加载图元失败: 未获取组件', this.componentPath)
        this.setStatus('加载失败')
        return null
      }
      return componentDefinition
    }
  }

  setStyle (style) {
    Object.assign(this.instanceStyle, style)
    if (style.position === 'absolute') {
      this.el.style.position = 'absolute'
      this.el.style.left = 0
      this.el.style.top = 0

      this.el.style.transform = `translate(${style.x}px, ${style.y}px)`
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
        this.properties[prop.name] = prop.value
      }

      // 处理属性的input情况 类似 vue的 v-model
      if (prop.name === 'value') {
        this.properties.input = val => {
          this.emit('input', val)
        }
      }

      if (prop.input === true) {
        // input相当于v-model，只能设置到一个属性上面
        const eventName = 'set' + prop.name.substr(0, 1).toUpperCase() + prop.name.substr(1)

        // 当双向绑定时， 获取动态绑定部分配置的属性值
        this.properties[eventName] = val => {
          this.emit(eventName, val)
        }
      }
    }

    // 事件类属性写入，DOM初始化后事件才能挂到源头
    for (const event of this.componentDefinition.events || []) {
      this.properties[event.name] = (...args) => {
        this.emit(event.name, ...args)
      }
    }
    // 子节点的fcView也同时放入
    if (this.childrenFcViews && this.childrenFcViews.length) {
      this.properties.children = this.childrenFcViews
      this.childrenFcViews.forEach(fcView => {
        fcView.setScopeVariables(this.scopeVariables)
      })
    }

    this.editorFeatures = this.componentDefinition.editorFeatures ?? {}
  }

  /**
     * 执行组件初次加载 mount到具体DOM元素
     */
  mount (el) {
    this.el = el
    this.el.className = 'ridge-element'
    this.el.elementWrapper = this
    this.forceUpdateStyle()

    if (!this.preloaded) {
      this.preload().then(() => {
        this.renderer = new ReactRenderer(this.componentDefinition.component, this.el, this.properties)
      })
    } else {
      this.renderer = new ReactRenderer(this.componentDefinition.component, this.el, this.properties)
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
    Object.assign(this.properties, props)
    if (this.renderer) {
      try {
        log('updateProps', this.id, this.properties)

        this.renderer.updateProps(Object.assign({
          _elementWrapper: this
        }, this.properties))
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
      this.pageManager.getVariableValues(),
      this.getScopeVariableValues()
    )
  }

  /**
   * 强制重新计算属性并更新组件显示
   */
  forceUpdate () {
    const updated = {}

    for (const propBindKey of Object.keys(this.instancePropConfigEx)) {
      updated[propBindKey] = template(this.instancePropConfigEx[propBindKey], this.getVariableContext())
    }
    this.updateProperties(updated)
  }

  updatePropertiesExpression (propsEx) {
    // 合并更新值
    Object.assign(this.instancePropBinding, propsEx)
  }

  invoke (method, args) {
    this.renderer.invoke(method, args)
  }

  emit (eventName, payload) {
    if (this.eventActionsConfig[eventName]) {
      for (const action of this.eventActionsConfig[eventName]) {
        if (action.name === 'setvar') {
          try {
            const newVariableValue = template(action.value, this.getVariableContext())
            this.pageManager.updatePageVariableValue(action.target, newVariableValue)
          } catch (e) {
            log('Event Action[setvar] Error', e)
          }
        }
      }
    }
  }

  appendChild (wrapper) {
    this.children.push(wrapper)
    this.properties.children.push(wrapper)
    this.updateProperties()
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

  addMaskLayer ({
    name,
    zIndex,
    className,
    text,
    content
  }) {
    if (this.el.querySelector('[name="' + name + '"]')) {
      return
    }
    const layer = document.createElement('div')

    layer.setAttribute('name', name)

    layer.classList.add('layer')

    layer.style.position = 'absolute'
    layer.style.left = 0
    layer.style.right = 0
    layer.style.top = 0
    layer.style.bottom = 0

    if (className) {
      layer.classList.add(className)
    }
    if (zIndex) {
      layer.style.zIndex = zIndex
    }
    layer.innerHTML = content || text || ''
    this.el.appendChild(layer)
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
