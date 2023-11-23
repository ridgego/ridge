import debug from 'debug'
import ReactRenderer from '../render/ReactRenderer'
import VanillaRender from '../render/VanillaRenderer'
import BaseNode from './BaseNode.js'
const log = debug('ridge:element')

class Element extends BaseNode {
  constructor ({
    config,
    composite
  }) {
    super()
    this.config = config
    this.composite = composite
    this.properties = {}
    this.events = {}
  }

  isRoot () {
    return this.config.parent == null
  }

  setRootIndex (index) {
    this.i = index
    if (this.el) {
      this.el.style.zIndex = index
    }
  }

  getId () {
    return this.config.id
  }

  getProperties () {
    return Object.assign({}, this.config.props, this.events, this.properties, {
      __composite: this.composite,
      __view: this,
      __isRuntime: true
    })
  }

  getConfig () {
    return this.config
  }

  getEl () {
    return this.el
  }

  getParent () {
    if (this.config.parent) {
      return this.composite.getNode(this.config.parent)
    }
    return null
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
    if (!el) {
      console.error('Mount Error: No Element')
      return
    }
    this.el = el
    this.el.ridgeNode = this
    this.el.classList.add('ridge-element')
    this.el.setAttribute('component', this.config.path)
    this.el.setAttribute('ridge-id', this.config.id)

    this.style = Object.assign({}, this.config.style)

    if (this.config.props.children != null) {
      this.isContainer = true
      this.el.classList.add('ridge-container')
    }

    this.updateStyle()
    this.updateConnectedStyle()
    this.updateConnectedProperties()

    this.initializeEvents()
    this.initSubscription()

    if (!this.componentDefinition) {
      await this.load()
    }

    this.renderer = this.createRenderer()
    this.mounted && this.mounted()
  }

  /**
   * 初始化组件属性、事件
   */
  initializeEvents () {
    // 属性名为value并且与state连接时， 增加 input 事件，事件传值回写到state
    if (this.config.propEx.value) {
      this.events.input = val => {
        this.composite.store.dispatchChange(this.config.propEx.value, [val])
      }
    }

    for (const [eventName, actions] of Object.entries(this.config.events)) {
      this.events[eventName] = (...payload) => {
        for (const action of actions) {
          if (action.store && action.method) {
            this.composite.store.doStoreAction(action.store, action.method, [...payload, action.payload, ...this.getScopedData()])
          }
        }
      }
    }
  }

  initSubscription () {
    // subscribe for update
    new Set([...Object.values(this.config.styleEx), ...Object.values(this.config.propEx)]).forEach(expr => {
      this.composite.store?.subscribe && this.composite.store.subscribe(expr, () => {
        this.forceUpdate()
      })
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

  /**
   * Re-evaluate connected properties and styles, update component view
   */
  forceUpdate () {
    this.updateConnectedStyle()
    this.updateStyle()
    this.updateConnectedProperties()
    this.updateProps()
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

  /**
   *  更新组件包装层样式
   *  Positioning/zIndex
   **/
  updateStyle () {
    // 页面根上更新布局
    const configStyle = this.config.style

    if (this.el) {
      if (configStyle.visible) {
        this.el.classList.remove('is-hidden')
      } else {
        this.el.classList.add('is-hidden')
      }
    }
    const parent = this.getParent()
    if (parent) {
      parent.invoke('updateChildStyle', [this])
    } else {
      const style = {}
      if (this.el) {
        if (configStyle.full) {
          style.width = '100%'
          style.height = '100%'
          this.el.classList.add('is-full')
        } else {
          // 绝对定位： 固定宽高
          style.position = 'absolute'
          style.left = 0
          style.top = 0
          style.transform = `translate(${configStyle.x}px, ${configStyle.y}px)`
          style.width = configStyle.width ? (configStyle.width + 'px') : ''
          style.height = configStyle.height ? (configStyle.height + 'px') : ''
        }
        style.zIndex = this.i
        Object.assign(this.el.style, style)
      }
    }
    this.invoke('updateStyle', [this])
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

  getChildNodes () {
    if (this.config.props.children) {
      return this.config.props.children.map(id => this.composite.getNode(id)).filter(t => t)
    } else {
      return null
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

    if (this.componentDefinition) {
      // 复制每个子节点
      this.forEachChildren((view, type, propName, index) => {
        const clonedChild = view.clone()
        clonedChild.containerView = cloned

        if (index == null) {
          // 复制slot类型  单值
          cloned.slotProperties[propName] = clonedChild
        } else {
          // 复制children类型  多值
          if (cloned.slotProperties[propName] == null) {
            cloned.slotProperties[propName] = []
          }
          cloned.slotProperties[propName][index] = clonedChild
        }
      })
    }
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
