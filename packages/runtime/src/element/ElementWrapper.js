import debug from 'debug'
import ReactRenderer from '../render/ReactRenderer'
import VanillaRender from '../render/VanillaRenderer'
import template from '../template'
const log = debug('ridge:el-wrapper')

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
    this.componentPath = config.path

    this.pageManager = pageManager
    // Runtime 给组件注入的属性值
    this.properties = {
      __pageManager: pageManager,
      __elementWrapper: this
    }
    this.initialize(navigator)
  }

  isRoot () {
    return this.config.parent == null
  }

  initialize () {
    const { config } = this
    // 组件的scope值数据
    this.scopeVariableValues = {}
    this.componentPath = config.path
    if (this.config.parent) {
      this.parentWrapper = this.pageManager.getElement(this.config.parent)
    }
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

  /**
   * 初始化组件属性、事件
   */
  initPropsAndEvents () {
    // 枚举、处理所有属性定义
    for (const prop of this.componentDefinition.props || []) {
      // 初始化时给一次默认值
      if (this.config.isNew) {
        if (this.config.props[prop.name] == null && prop.value != null) {
          this.config.props[prop.name] = prop.value
        }
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

    delete this.config.isNew
    this.editorFeatures = this.componentDefinition.editorFeatures ?? {}
  }

  /**
     * 执行组件初次加载 mount到具体DOM元素
     */
  mount (el) {
    this.el = el
    this.el.classList.add('ridge-element')
    this.el.setAttribute('ridge-id', this.id)
    this.el.elementWrapper = this
    this.forceUpdateStyle()

    if (!this.preloaded) {
      this.preload().then(() => {
        this.renderer = this.createRenderer()
      })
    } else {
      this.renderer = this.createRenderer()
    }
  }

  unmount () {
    if (this.renderer) {
      this.renderer.destroy()
      this.renderer = null
    }
    if (this.el) {
      this.el.parentElement.removeChild(this.el)
      this.el = null
    }
  }

  createRenderer () {
    if (this.componentDefinition.type === 'vanilla') {
      return new VanillaRender(this.componentDefinition.component, this.el, this.getProperties())
    } else {
      return new ReactRenderer(this.componentDefinition.component, this.el, this.getProperties())
    }
  }

  getProperties () {
    return Object.assign({}, this.config.props, this.properties)
  }

  forceUpdateStyle () {
    if (this.el) {
      this.el.style.width = this.config.style.width ? (this.config.style.width + 'px') : ''
      this.el.style.height = this.config.style.height ? (this.config.style.height + 'px') : ''
      this.el.style.position = this.config.style.position
      if (this.config.style.position === 'absolute') {
        this.el.style.transform = `translate(${this.config.style.x}px, ${this.config.style.y}px)`
      } else {
        this.el.style.transform = ''
      }
      if (Object.keys(this.config.styleEx).length) {
        if (this.instanceStyleEx.width) {
          this.el.style.width = template(this.config.styleEx.width, this.getVariableContext()) + 'px'
        }
      }
    }
  }

  updateProperties (props) {
    if (props) {
      Object.assign(this.properties, props)
    }
    if (this.renderer) {
      try {
        log('updateProps', this.id, this.properties)

        this.renderer.updateProps(this.getProperties())
      } catch (e) {
        log('用属性渲染组件出错', e)
      }
    } else {
      log('updateProps umounted', this.id)
    }
  }

  setScopeVariableValues (scopeVariableValues) {
    this.scopeVariableValues = scopeVariableValues
  }

  getScopeVariableValues () {
    if (this.parentWrapper) {
      return Object.assign(this.parentWrapper.getScopeVariableValues(), this.scopeVariableValues)
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
    for (const propBindKey of Object.keys(this.config.propEx)) {
      this.properties[propBindKey] = template(this.config.propEx[propBindKey], this.getVariableContext())
    }
    this.updateProperties()
  }

  invoke (method, args) {
    return this.renderer.invoke(method, args)
  }

  emit (eventName, payload) {
    if (eventName === 'input' && !this.config.events[eventName]) {
      if (this.config.propEx.value && Object.keys(this.getVariableContext()).indexOf(this.config.propEx.value) > -1) {
        this.pageManager.updatePageVariableValue(this.config.propEx.value, payload)
      }
      return
    }
    if (this.config.events[eventName]) {
      // 处理input/value事件
      for (const action of this.config.events[eventName]) {
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

  getCreateChildElement (name) {}

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
}

export default ElementWrapper
