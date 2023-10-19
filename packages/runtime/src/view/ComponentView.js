import debug from 'debug'
import ReactRenderer from '../render/ReactRenderer'
import VanillaRender from '../render/VanillaRenderer'
import ElementView from './ElementView'
import { objectSet } from '../utils/object'
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
  }

  isRoot () {
    return this.config.parent == null
  }

  getId () {
    return this.config.id
  }

  getProperties () {
    return this.properties
  }

  getConfig () {
    return this.config
  }

  getEl () {
    return this.el
  }

  getScopedData () {
    const parentScopes = this.containerView ? this.containerView.getScopedData() : {}
    return Object.assign({}, parentScopes, this.scopedData)
  }

  setScopedData (scopedData) {
    this.scopedData = scopedData
  }

  async loadAndMount (el) {
    this.el = el
    this.updateStyle()
    await this.preload()

    if (this.componentDefinition) {
      this.mount()
    }
  }

  /**
   * 加载组件代码、按代码初始化属性
   */
  async preload (deepPreload) {
    if (this.preloaded) return

    this.setStatus('loading')

    if (this.componentDefinition == null) {
      if (this.config.path) {
        this.componentDefinition = await this.context.loadComponent(this.config.path)
      }
    }

    if (!this.componentDefinition) {
      this.setStatus('not-found')
    }
    // if (deepPreload) {
    //   if (this.config.props.children) {
    //     for (const childId of this.config.props.children) {
    //       const childWrapper = this.pageManager.getElement(childId)
    //       await childWrapper.preload(deepPreload)
    //     }
    //   }
    // }
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
    this.el.setAttribute('ridge-id', this.id)

    this.context.delegateMethods(this, ['hasMethod', 'invoke', 'updateProps', 'forceUpdate', 'getConfig'], this.el)

    this.el.view = this
    this.el.wrapper = this
    this.el.componentPath = this.componentPath

    this.style = Object.assign({}, this.config.style)

    this.initPropsAndEvents()
    this.updateConnectedStyle()
    this.updateConnectedProperties()

    this.renderer = this.createRenderer()
  }

  /**
   * 初始化组件属性、事件
   */
  initPropsAndEvents () {
    if (this.config.parent && !this.containerView) {
      this.containerView = this.context.getComponentView(this.config.parent)
    }
    this.properties = {}

    for (const prop of this.componentDefinition.props || []) {
      if (!prop) continue

      if (this.config.props[prop.name] != null) {
        this.properties[prop.name] = this.config.props[prop.name]
      }

      // 编辑器初始化创建时给一次默认值
      // if (this.isCreate) {
      //   if (this.config.props[prop.name] == null && prop.value != null) {
      //     this.config.props[prop.name] = prop.value
      //   }
      // }

      // value property:add input event
      if (prop.name === 'value') {
        this.properties.input = val => {
          this.emit('input', val)
        }
      }

      // same as value
      if (prop.input === true) {
        // input相当于v-model，只能设置到一个属性上面
        const eventName = 'set' + prop.name.substr(0, 1).toUpperCase() + prop.name.substr(1)

        // 当双向绑定时， 获取动态绑定部分配置的属性值
        this.properties[eventName] = val => {
          this.emit(eventName, val)
        }
      }

      if (prop.name === 'children') {
        this.el.classList.add('ridge-container')

        // 写入子级的具体包装类
        if (Array.isArray(this.config.props.children)) {
          this.properties.children = this.config.props.children.map(element => {
            if (typeof element === 'string') {
              return this.context.getComponentView(element)
            } else {
              return element
            }
          })
        }
      } else if (prop.type === 'slot') {
        this.isContainer = true
        this.el.classList.add('ridge-droppable')
        // 写入slot的包装类
        if (this.config.props[prop.name] && typeof this.config.props[prop.name] === 'string') {
          const childComponentView = this.context.getComponentView(this.config.props[prop.name])
          if (childComponentView) {
            childComponentView.parentView = this
            this.properties[prop.name] = childComponentView
          }
        }
      } else if (prop.type === 'ref') {

      }
    }
    // 事件类属性写入，DOM初始化后事件才能挂到源头
    for (const event of this.componentDefinition.events || []) {
      this.properties[event.name] = (...args) => {
        this.emit(event.name, args)
      }
    }

    // subscribe for update
    new Set([...Object.values(this.config.styleEx), ...Object.values(this.config.propEx)]).forEach(expr => {
      this.context.subscribe(expr, () => {
        this.forceUpdate()
      })
    })
  }

  createRenderer () {
    try {
      if (this.componentDefinition.type === 'vanilla') {
        const render = new VanillaRender(this.componentDefinition.component, this.getProperties())
        render.mount(this.el)
        return render
      } else {
        const render = new ReactRenderer(this.componentDefinition.component, this.getProperties())
        render.mount(this.el)
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

  // 计算随变量绑定的样式
  updateConnectedStyle () {
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
    this.el.classList.remove('is-full')
    this.el.classList.remove('is-locked')
    this.el.classList.remove('is-hidden')

    if (this.containerView && this.containerView.hasMethod('updateChildStyle')) {
    // delegate to container
      this.containerView.invoke('updateChildStyle', [this])
    } else {
      // update position and index
      const style = {}
      if (this.el) {
        if (this.config.style.full) {
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
          style.zIndex = this.i
        }
        Object.assign(this.el.style, style)
      }
    }
    this.invoke('updateStyle', [this])
  }

  /**
   * 计算所有表达式值
   */
  updateConnectedProperties () {
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
      // const propDef = this.getPropDefinationByName(key)

      // if (propDef && typeof propDef.connect === 'string') {
      //   // 判断 connect为path的情况 按path设置属性的路径数据
      //   // 因为是对象类型， 直接只改path值可能会直接改动
      //   const value = JSON.parse(JSON.stringify(this.properties[key]))
      //   objectSet(value, propDef.connect, storeValue)
      //   this.properties[key] = value
      // } else {
      //   this.properties[key] = storeValue
      // }
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

  invoke (method, args) {
    if (this.renderer) {
      return this.renderer.invoke(method, args)
    }
  }

  hasMethod (methodName) {
    if (this.renderer) {
      return this.renderer.hasMethod(method)
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
