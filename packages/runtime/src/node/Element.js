import debug from 'debug'
import ReactRenderer from '../render/ReactRenderer'
import VanillaRender from '../render/VanillaRenderer'
import { nanoid } from '../utils/string'
import BaseNode from './BaseNode.js'
const log = debug('ridge:element')

class Element extends BaseNode {
  constructor ({
    config,
    composite,
    componentDefinition
  }) {
    super()
    this.uuid = 'ins-' + nanoid(8)
    this.config = config
    this.composite = composite
    this.componentDefinition = componentDefinition
    this.properties = {}
    this.events = {}
  }

  isRoot () {
    return this.config.parent == null
  }

  getId () {
    return this.config.id
  }

  getProperties () {
    return Object.assign({}, this.config.props, this.events, this.properties, {
      children: this.children
    })
  }

  getConfig () {
    return this.config
  }

  getEl () {
    return this.el
  }

  getParent () {
    return this.parent
  }

  getScopedData () {
    const parent = this.getParent()
    const parentScopes = parent ? parent.getScopedData() : []

    if (this.scopedData == null) {
      return parentScopes
    } else {
      return [this.scopedData, ...parentScopes]
    }
  }

  setScopedData (scopedData) {
    this.scopedData = scopedData
  }

  /**
   * 加载组件代码、按代码初始化属性
   * @param isDeep 是否随之加载子组件 默认不加载
   */
  async load () {
    if (this.componentDefinition) {
      return
    }
    this.setStatus('loading')
    if (this.config.path) {
      this.componentDefinition = await this.composite.context.loadComponent(this.config.path)
    }
    if (!this.componentDefinition) {
      this.setStatus('not-found')
    } else {
      this.removeStatus('loading')
    }
  }

  /**
     * 执行组件初次加载 mount到具体DOM元素
     */
  async mount (el) {
    this.el = el
    this.el.ridgeNode = this
    this.el.setAttribute('component', this.config.path)
    this.el.setAttribute('ridge-id', this.config.id)
    this.el.classList.add('ridge-element')

    this.style = Object.assign({}, this.config.style)

    this.updateConnectedStyle()
    this.updateStyle()
    this.updateConnectedProperties()

    this.initializeEvents()
    this.initSubscription()

    if (!this.componentDefinition) {
      await this.load()
    }
    this.renderer = this.createRenderer()
    this.mounted && this.mounted()
  }

  initChildren () {
    if (this.config.props.children && this.children == null) {
      this.children = []
      for (const id of this.config.props.children) {
        const childNode = this.composite.getNode(id)
        if (childNode) {
          childNode.parent = this
          childNode.initChildren()
          this.children.push(childNode)
        }
      }
    }
  }

  /**
   * 初始化组件属性、事件
   */
  initializeEvents () {
    // 属性名为value并且与state连接时， 增加 input 事件，事件传值回写到state
    if (this.config.propEx.value) {
      this.events.input = val => {
        this.composite.store.dispatchChange(this.config.propEx.value, [val, ...this.getScopedData()])
      }
    }

    for (const [eventName, actions] of Object.entries(this.config.events ?? {})) {
      this.events[eventName] = (...payload) => {
        for (const action of actions) {
          if (action.store && action.method) {
            const scopeData = this.getScopedData()
            const event = {
              payload,
              param: action.payload
            }
            this.composite.store.doStoreAction(action.store, action.method, event, scopeData)
          }
        }
      }
    }
  }

  // 动态指定的属性和样式的更新
  initSubscription () {
    Object.values(this.config.styleEx).forEach(expr => {
      this.composite.store?.subscribe && this.composite.store.subscribe(expr, () => {
        this.forceUpdateStyle()
      }, this.uuid + '-style')
    })

    Object.values(this.config.propEx).forEach(expr => {
      this.composite.store?.subscribe && this.composite.store.subscribe(expr, () => {
        this.forceUpdateProperty()
      }, this.uuid + '-prop')
    })
  }

  createRenderer () {
    if (this.componentDefinition == null) {
      this.setStatus('load-error')
      return null
    }
    try {
      if (this.componentDefinition.type === 'vanilla') {
        const render = new VanillaRender(this.componentDefinition.component, this.getProperties())
        render.mount(this.el)
        this.removeStatus()
        return render
      } else {
        const render = new ReactRenderer(this.componentDefinition.component, this.getProperties())
        render.mount(this.el)
        this.removeStatus()
        return render
      }
    } catch (e) {
      this.setStatus('render-error')
      console.error('组件初始化渲染异常', this.componentDefinition, e)
    }
    return null
  }

  forceUpdateStyle () {
    this.updateConnectedStyle()
    this.updateStyle()
  }

  forceUpdateProperty () {
    this.updateConnectedProperties()
    this.updateProps()
  }

  /**
   * Re-evaluate connected properties and styles, update component view
   */
  forceUpdate () {
    this.forceUpdateStyle()
    this.forceUpdateProperty()
  }

  /**
   * 更新动态属性
   * @param {*} props 要更改的属性
   */
  updateProps (props) {
    if (props) {
      Object.assign(this.properties, props)
    }
    if (this.renderer) {
      const propertiesForUpdate = this.getProperties()
      try {
        log('updateProps', this.config.id, propertiesForUpdate)
        this.renderer.updateProps(this.getProperties())
      } catch (e) {
        log('Render Error:', e, this, propertiesForUpdate)
      }
    } else {
      log('updateProps umounted', this.id)
    }
  }

  // 计算随变量绑定的样式
  updateConnectedStyle () {
    if (!this.composite.store) return

    for (const styleName of Object.keys(this.config.styleEx || {})) {
      if (this.config.styleEx[styleName] == null || this.config.styleEx[styleName] === '') {
        continue
      }
      this.style[styleName] = this.composite.store.getStoreValue(this.config.styleEx[styleName], this.getScopedData())
    }
  }

  updateChildStyle (childNode) {
    this.invoke('updateChildStyle', [childNode])
  }

  /**
   *  更新组件外层样式
   **/
  updateStyle () {
    if (this.el) {
      // 处理显隐状态
      if (this.config.visible === false) {
        this.el.classList.add('ridge-is-hidden')
      } else if (this.config.visible === true) {
        this.el.classList.remove('ridge-is-hidden')
      }
    }
    this.parent && this.parent.updateChildStyle(this)
    this.invoke('onStyleUpdated', [this])
  }

  /**
   * 计算所有表达式值
   */
  updateConnectedProperties () {
    if (!this.composite.store) return
    for (const [key, value] of Object.entries(this.config.propEx)) {
      if (value == null || value === '') {
        continue
      }
      try {
        this.properties[key] = this.composite.store.getStoreValue(value, this.getScopedData())
      } catch (e) {
        // if error, the properties won't change
        console.error('get Store Value Error: ', e)
      }
    }
  }

  emit (eventName, payload) {
    if (!this.composite.store) return
    log('Emit Event:', eventName, payload)
    if (eventName === 'input' && !this.config.events[eventName]) {
      // 处理双向绑定的情况
      if (this.config.propEx.value) {
        this.composite.store.dispatchChange(this.config.propEx.value, [payload, ...this.getScopedData()])
      }
      return
    }
    if (this.config.events[eventName]) {
      // 处理input/value事件
      for (const action of this.config.events[eventName]) {
        if (action.store && action.method) {
          this.composite.store.doStoreAction(action.store, action.method, [...payload, action.payload, ...this.getScopedData()])
        }
      }
    }
  }

  /**
   * 作为循环渲染时，复制列表项模板处理
   **/
  clone () {
    const cloned = new Element({
      composite: this.composite,
      componentDefinition: this.componentDefinition,
      config: this.config
    })

    if (this.children) {
      cloned.children = []
      for (const childNode of this.children) {
        const childNodeCloned = childNode.clone()
        childNodeCloned.parent = cloned
        cloned.children.push(childNodeCloned)
      }
    }
    cloned.parent = this.parent
    return cloned
  }

  invoke (method, args) {
    if (this.renderer) {
      return this.renderer.invoke(method, args)
    }
  }

  hasMethod (methodName) {
    if (this.renderer) {
      return this.renderer.hasMethod(methodName)
    } else {
      return false
    }
  }

  unmount () {
    if (this.renderer) {
      this.renderer.destroy()
      this.renderer = null
    }
    if (this.el && this.el.parentElement) {
      this.el.parentElement.removeChild(this.el)
    }
    this.el = null
  }
}

export default Element
