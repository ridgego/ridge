import debug from 'debug'
import ReactRenderer from '../render/ReactRenderer'
import VanillaRender from '../render/VanillaRenderer'
import ElementView from './ElementView'
const log = debug('ridge:component')

class ComponentView extends ElementView {
  constructor ({
    config,
    context,
    i
  }) {
    super()
    this.i = i
    this.config = config
    this.context = context

    this.properties = {}
    this.slotProperties = {}
    this.eventProperties = {}
  }

  isRoot () {
    return this.config.parent == null
  }

  getId () {
    return this.config.id
  }

  getProperties () {
    return Object.assign({}, this.properties, this.slotProperties, this.eventProperties)
  }

  getConfig () {
    return this.config
  }

  getEl () {
    return this.el
  }

  getScopedData () {
    const parentScopes = this.containerView ? this.containerView.getScopedData() : []
    return [this.scopedData, ...parentScopes]
  }

  setScopedData (scopedData) {
    this.scopedData = scopedData
  }

  async loadAndMount (el) {
    this.el = el
    this.updateStyle()
    if (!this.preloaded) {
      await this.preload()
    }

    if (this.componentDefinition) {
      this.initPropsAndEvents()
      this.mount()
    }
  }

  /**
   * 加载组件代码、按代码初始化属性
   * @param isDeep 是否随之加载子组件 默认不加载
   */
  async preload (isDeep) {
    this.setStatus('loading')

    if (this.config.path) {
      this.componentDefinition = await this.context.loadComponent(this.config.path)
    }

    if (isDeep) {
      const loadPromises = []
      this.forEachChildren((childView) => {
        loadPromises.push(childView.preload(true))
      })
      await Promise.allSettled(loadPromises)
    }

    if (!this.componentDefinition) {
      this.setStatus('not-found')
    }
  }

  async loadComponentDefinition () {
    // 加载组件定义信息
    if (this.componentPath) {
      const componentDefinition = await this.pageManager.ridge.loadComponent(this.componentPath)
      return componentDefinition
    } else {
      return null
    }
  }

  /**
     * 执行组件初次加载 mount到具体DOM元素
     */
  mount (el) {
    if (el) {
      this.el = el
    }
    this.el.classList.add('ridge-element')
    this.el.setAttribute('ridge-id', this.config.id)

    this.context.delegateMethods(this, ['hasMethod', 'invoke', 'updateProps', 'forceUpdate', 'getConfig'], this.el)

    this.el.view = this
    this.style = Object.assign({}, this.config.style)

    if (this.isContainer) {
      this.el.classList.add('ridge-container')
    }
    this.updateConnectedStyle()
    this.updateConnectedProperties()

    this.renderer = this.createRenderer()

    this.mounted && this.mounted()
  }

  /**
   * 初始化组件属性、事件
   */
  initPropsAndEvents () {
    if (this.config.parent && !this.containerView) {
      this.containerView = this.context.getComponentView(this.config.parent)
    }

    for (const prop of this.componentDefinition.props || []) {
      if (!prop) continue
      // 编辑器初始化创建时给一次默认值
      // if (this.isCreate) {
      //   if (this.config.props[prop.name] == null && prop.value != null) {
      //     this.config.props[prop.name] = prop.value
      //   }
      // }
      // value property:add input event
      if (prop.name === 'value') {
        this.eventProperties.input = val => {
          this.emit('input', val)
        }
      }

      // same as value
      if (prop.input === true) {
        // input相当于v-model，只能设置到一个属性上面
        const eventName = 'set' + prop.name.substr(0, 1).toUpperCase() + prop.name.substr(1)

        // 当双向绑定时， 获取动态绑定部分配置的属性值
        this.eventProperties[eventName] = val => {
          this.emit(eventName, val)
        }
      }

      if (prop.name === 'children') {
        this.isContainer = true
        // 写入子级的具体包装类
        if (Array.isArray(this.config.props.children)) {
          if (this.slotProperties.children == null) {
            this.slotProperties.children = this.config.props.children.map(element => {
              if (typeof element === 'string') {
                return this.context.getComponentView(element)
              } else {
                return element
              }
            })
          }
        }
      } else if (prop.type === 'slot') {
        this.isContainer = true
        // 写入slot的包装类
        if (this.config.props[prop.name] && typeof this.config.props[prop.name] === 'string') {
          if (this.slotProperties[prop.name] == null) {
            const childComponentView = this.context.getComponentView(this.config.props[prop.name])
            if (childComponentView) {
              childComponentView.parentView = this
              this.slotProperties[prop.name] = childComponentView
            }
          }
        }
      } else {
        if (this.config.props[prop.name] != null) {
          this.properties[prop.name] = this.config.props[prop.name]
        }
      }
    }
    // 事件类属性写入，DOM初始化后事件才能挂到源头
    for (const event of this.componentDefinition.events || []) {
      this.eventProperties[event.name] = (...args) => {
        this.emit(event.name, args)
      }
    }

    // subscribe for update
    new Set([...Object.values(this.config.styleEx), ...Object.values(this.config.propEx)]).forEach(expr => {
      this.context.subscribe && this.context.subscribe(expr, () => {
        this.forceUpdate()
      })
    })
  }

  createRenderer () {
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
    if (!this.context.getStoreValue) return

    for (const styleName of Object.keys(this.config.styleEx || {})) {
      if (this.config.styleEx[styleName] == null || this.config.styleEx[styleName] === '') {
        continue
      }
      this.style[styleName] = this.context.getStoreValue(this.config.styleEx[styleName], this.getScopedData())
    }
  }

  /**
   *  Update the style of mounted Element. Include:
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

    if (this.containerView && this.containerView.hasMethod('updateChildStyle')) {
    // delegate to container
      this.containerView.invoke('updateChildStyle', [this])
    } else {
      // update position and index
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
    if (!this.context.getStoreValue) return
    for (const [key, value] of Object.entries(this.config.propEx)) {
      if (value == null || value === '') {
        continue
      }
      try {
        this.properties[key] = this.context.getStoreValue(value, this.getScopedData())
      } catch (e) {
        // if error, the properties won't change
        console.error('get Store Value Error: ', e)
      }
    }
  }

  emit (eventName, payload) {
    log('Emit Event:', eventName, payload)
    if (eventName === 'input' && !this.config.events[eventName]) {
      // 处理双向绑定的情况
      if (this.config.propEx.value) {
        this.context.dispatchStateChange(this.config.propEx.value, payload)
      }
      return
    }
    if (this.config.events[eventName]) {
      // 处理input/value事件
      for (const action of this.config.events[eventName]) {
        if (action.method) {
          const [target, method] = action.method.split('.')
          this.context.doStoreAction(target, method, [...payload, action.payload, ...this.getScopeItems()])
        }
      }
    }
  }

  /**
   * 作为循环渲染时，复制列表项模板处理
   **/
  clone () {
    const cloned = new ComponentView({
      context: this.context,
      config: this.config
    })

    cloned.containerView = this.containerView

    if (this.componentDefinition) {
      cloned.componentDefinition = this.componentDefinition
      cloned.preloaded = true

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

  /**
   * 枚举每个子节点
   * @param {*} cb
   */
  forEachChildren (cb) {
    // 递归处理子节点树
    if (this.componentDefinition == null) {
      return
    }
    const childProps = this.componentDefinition.props.filter(p => p.type === 'children')
    if (childProps.length) {
      for (const childProp of childProps) {
        if (this.config.props[childProp.name] && this.config.props[childProp.name].length) {
          for (let i = 0; i < this.config.props[childProp.name].length; i++) {
            if (this.config.props[childProp.name][i]) {
              cb(this.context.getComponentView(this.config.props[childProp.name][i]), 'children', childProp.name, i)
            }
          }
        }
      }
    }

    // 递归处理插槽节点
    const slotProps = this.componentDefinition.props.filter(p => p.type === 'slot')
    if (slotProps.length) {
      for (const childProp of slotProps) {
        if (this.config.props[childProp.name]) {
          cb(this.context.getComponentView(this.config.props[childProp.name]), 'slot', childProp.name)
        }
      }
    }
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

export default ComponentView
