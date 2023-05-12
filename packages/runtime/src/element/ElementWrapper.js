import debug from 'debug'
import ReactRenderer from '../render/ReactRenderer'
import VanillaRender from '../render/VanillaRenderer'
import { nanoid } from '../utils/string'
const log = debug('ridge:element')
const error = debug('error:element')

/**
 * 组件封装类
 */
class ElementWrapper {
  constructor ({
    config,
    mode,
    pageManager,
    isCreate
  }) {
    this.config = config
    this.id = config.id
    this.componentPath = config.path
    this.isCreate = isCreate

    this.mode = mode
    this.pageManager = pageManager
    this.pageStore = pageManager.pageStore
    this.ridge = pageManager.ridge

    // 系统内置属性
    this.systemProperties = {
      __mode: this.mode,
      __pageManager: pageManager,
      __elementWrapper: this
    }
    // 存放计算值、运行时配置更新值
    this.properties = {}

    // 存放样式的计算值
    this.style = {}

    // 局部状态
    this.scopeState = {}
  }

  isRoot () {
    return this.config.parent == null
  }

  getConfig () {
    return this.config
  }

  /**
   * 复制组件实例
   * @returns
   */
  clone () {
    const cloned = new ElementWrapper({
      mode: this.mode,
      config: this.toJSON(),
      pageManager: this.pageManager
    })
    cloned.cloneFrom = cloned.id
    cloned.config.id = nanoid(5)
    cloned.id = cloned.config.id
    delete cloned.config.parent

    if (this.componentDefinition) {
      cloned.componentDefinition = this.componentDefinition
      cloned.preloaded = true
    }

    if (cloned.config.props.children) {
      cloned.config.props.children = cloned.config.props.children.map(wrapperId => {
        const templateNode = this.pageManager.getElement(wrapperId)
        const clonedChild = templateNode.clone()
        clonedChild.parentWrapper = cloned
        return clonedChild
      })
    }
    return cloned
  }

  async loadAndMount (el) {
    this.el = el
    this.el.classList.add('ridge-element')
    this.el.setAttribute('ridge-id', this.id)
    this.el.elementWrapper = this
    this.el.componentPath = this.componentPath

    await this.preload()
    this.mount(el)
  }

  /**
   * 加载组件代码、按代码初始化属性
   */
  async preload (deepPreload) {
    if (this.preloaded) return

    this.setStatus('Loading')
    this.componentDefinition = await this.loadComponentDefinition()

    if (deepPreload) {
      if (this.config.props.children) {
        for (const childId of this.config.props.children) {
          const childWrapper = this.pageManager.getElement(childId)
          await childWrapper.preload(deepPreload)
        }
      }
    }
    if (this.componentDefinition) {
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
    } else {
      return null
    }
  }

  /**
   * 枚举每个子节点
   * @param {*} cb 
   */
  forEachChildren(cb) {
    // 递归处理子节点树
    const childProps = this.componentDefinition.props.filter(p => p.type === 'children')
    if (childProps.length) {
      for (const childProp of childProps) {
        if (this.config.props[childProp.name] && this.config.props[childProp.name].length) {
          for (const elementId of this.config.props[childProp.name]) {
            cb(this.pageManager.pageElements[elementId], 'children', childProp.name)
          }
        }
      }
    }

    // 递归处理插槽节点
    const slotProps = this.componentDefinition.props.filter(p => p.type === 'slot')
    if (slotProps.length) {
      for (const childProp of slotProps) {
        if (this.config.props[childProp.name]) {
          cb(this.pageManager.pageElements[this.config.props[childProp.name]], 'slot', childProp.name)
        }
      }
    }
  }
  

  /**
   * 初始化组件属性、事件
   */
  initPropsAndEvents () {
    this.slotProps = []
    if (!this.componentDefinition) {
      return
    }

    if (this.config.parent && !this.parentWrapper) {
      this.parentWrapper = this.pageManager.getElement(this.config.parent)
    }

    this.adjustSize = this.componentDefinition.adjustSize
    this.resizable = this.componentDefinition.resizable

    // 枚举、处理所有属性定义
    for (const prop of this.componentDefinition.props || []) {
      if (!prop) continue

      // 编辑器初始化创建时给一次默认值
      if (this.isCreate) {
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

      if (prop.name === 'children') {
        this.children = []
        this.isContainer = true
        this.el.classList.add('ridge-container')

        // 写入子级的具体包装类
        if (Array.isArray(this.config.props.children)) {
          this.properties.children = this.config.props.children.map(element => {
            if (typeof element === 'string') {
              return this.pageManager.getElement(element)
            } else {
              return element
            }
          }).filter(child => child)
        }
      } else if (prop.type === 'slot') {
        this.isContainer = true
        this.el.classList.add('ridge-droppable')
        this.slotProps.push(prop.name)
        // 写入slot的包装类
        if (this.config.props[prop.name] && typeof this.config.props[prop.name] === 'string') {
          const childrenWrapper = this.pageManager.getElement(this.config.props[prop.name])
          if (childrenWrapper) {
            childrenWrapper.parentWrapper = this
            this.properties[prop.name] = childrenWrapper

          }
        }
      }
    }
    // 事件类属性写入，DOM初始化后事件才能挂到源头
    for (const event of this.componentDefinition.events || []) {
      this.properties[event.name] = (...args) => {
        this.emit(event.name, ...args)
      }
    }

    if (!this.isCreate) {
      this.updateAssetsProperties()
      this.updateExpressionedProperties()
      // TODO 检查动态绑定的情况，按需对store变化进行响应
    }

    if (this.mode !== 'edit') {
      // 将所有需要连接的属性传入订阅
      this.pageStore && this.pageStore.subscribe(this.id, () => {
        this.forceUpdate()
      }, [...Object.values(this.config.styleEx), ...Object.values(this.config.propEx)])
    }
  }

  isMounted () {
    return this.el != null
  }

  /**
     * 执行组件初次加载 mount到具体DOM元素
     */
  mount () {
    this.el.hasMethod = this.hasMethod.bind(this)
    this.el.invoke = this.invoke.bind(this)
    this.el.forceUpdate = this.forceUpdate.bind(this)
    this.el.getConfig = this.getConfig.bind(this)

    this.style = Object.assign({}, this.config.style)
    this.updateExpressionedStyle()
    this.updateStyle()
    this.initPropsAndEvents()
    this.renderer = this.createRenderer()
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

    this.pageStore && this.pageStore.unsubscribe(this.id)
  }

  /**
   * 调用组件依托的技术框架渲染内容
   * @returns
   */
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
      console.error('组件初始化渲染异常', this.componentDefinition, e)
    }
    return null
  }

  getProperties () {
    return Object.assign({},
      this.config.props, // 配置的静态属性
      this.systemProperties, // 系统属性
      this.properties // 动态计算属性
    )
  }

  /**
   * 根据配置更新组件大小
   */
  updateSize () {
    if (this.adjustSize && this.el) {
      const contentEl = this.el.querySelector(':not(.ridge-overlay)')

      this.setConfigStyle({
        width: contentEl.getBoundingClientRect().width,
        height: contentEl.getBoundingClientRect().height
      })
      if (this.ridge.workspaceControl) {
        this.ridge.workspaceControl.updateMovable()
      }
    }
  }

  // 计算随变量绑定的样式
  updateExpressionedStyle () {
    if (this.pageManager.mode === 'edit') return
    for (const styleName of Object.keys(this.config.styleEx || {})) {
      if (this.config.styleEx[styleName] == null || this.config.styleEx[styleName] === '') {
        continue
      }
      this.style[styleName] = this.pageStore.getStateValue(this.config.styleEx[styleName], this.getContextState())
    }
  }

  // 供容器调用更改容器内布局方式
  setConfigStyle (style) {
    Object.assign(this.config.style, style)
    this.updateStyle()
  }

  getResetStyle () {
    return {
      left: '',
      top: '',
      flex: '',
      position: '',
      display: '',
      transform: ''
    }
  }

  // 更新布局样式
  updateStyle () {
    // 页面根上更新布局
    const configStyle = this.config.style
    this.el.classList.remove('is-full')
    this.el.classList.remove('is-locked')
    this.el.classList.remove('is-hidden')
    if (this.parentWrapper && this.parentWrapper.hasMethod('updateChildStyle')) {
      this.parentWrapper.invoke('updateChildStyle', [this])
      this.invoke('updateStyle', [this])
    } else {
      const style = Object.assign({}, this.getResetStyle())
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
        }
        Object.assign(this.el.style, style)
      }
    }

    if (configStyle.visible === false) {
      this.el.classList.add('is-hidden')
    }

    // 设置编辑器的属性
    if (this.mode === 'edit') {
      // 编辑器特有：锁定
      if (configStyle.locked === true) {
        this.el.classList.add('is-locked')
      }
    }
  }

  /**
   * 更新动态属性
   * @param {*} props 要更改的属性
   */
  renderUpdate (props) {
    if (props) {
      Object.assign(this.properties, props)
    }
    if (this.renderer) {
      try {
        log('updateProps', this.id, this.properties)

        this.updateAssetsProperties()
        this.renderer.updateProps(this.getProperties())
      } catch (e) {
        log('用属性渲染组件出错', e)
      }
    } else {
      log('updateProps umounted', this.id)
    }
  }

  setScopeStateValues (state) {
    this.scopeState = Object.assign({}, this.scopeState, state)

    this.forceUpdate()
  }

  getScopeStateValues () {
    if (this.parentWrapper) {
      return Object.assign(this.parentWrapper.getScopeStateValues(), this.scopeState)
    } else {
      return this.scopeState
    }
  }

  /**
     * 获取当前组件可见的上下文变量信息
     */
  getContextState () {
    return Object.assign({},
      this.pageManager.pageStore.getState(),
      this.getScopeStateValues()
    )
  }

  /**
   * 强制更新、计算所有属性
   */
  forceUpdate () {
    this.updateExpressionedStyle()
    this.updateStyle()

    this.updateExpressionedProperties()
    this.renderUpdate()
  }

  /**
   * 计算所有表达式值
   */
  updateExpressionedProperties () {
    if (this.pageManager.mode === 'edit') return
    for (const [key, value] of Object.entries(this.config.propEx)) {
      if (value == null || value === '') {
        continue
      }
      this.properties[key] = this.pageStore.getStateValue(value, this.getContextState())
    }
  }

  // 处理本地模式下，图片地址换为本地dataUrl
  updateAssetsProperties () {
    if (this.pageManager.mode === 'edit' || this.pageManager.mode === 'preview') {
      const imageProps = this.componentDefinition.props.filter(prop => prop.type === 'image')
      for (const imgProp of imageProps) {
        if (this.config.props[imgProp.name]) {
          this.properties[imgProp.name] = this.ridge.appService.getDataUrl(this.config.props[imgProp.name])
        } else {
          this.properties[imgProp.name] = ''
        }
      }
    }
  }

  removeChild (wrapper) {
    if (this.renderer) {
      const result = this.renderer.invoke('removeChild', [wrapper])
      Object.assign(this.config.props, result)
    }
    delete wrapper.config.parent
    delete wrapper.parentWrapper
  }

  invoke (method, args) {
    if (this.renderer) {
      return this.renderer.invoke(method, args)
    }
  }

  hasMethod (method) {
    return this.renderer.hasMethod(method)
  }

  // 组件对外发出事件
  async emit (eventName, payload) {
    // 无store 不处理事件
    if (!this.pageStore) {
      return
    }
    log('Event:', eventName, payload)
    if (eventName === 'input' && !this.config.events[eventName]) {
      // 处理双向绑定的情况
      if (this.config.propEx.value && Object.keys(this.getContextState()).indexOf(this.config.propEx.value) > -1) {
        this.pageStore.setState({
          [this.config.propEx.value]: payload
        })
      }
      return
    }
    if (this.config.events[eventName]) {
      // 处理input/value事件
      for (const action of this.config.events[eventName]) {
        if (action.method) {
          const [target, reducer] = action.method.split('.')
          if (target === 'page') {
            await this.pageStore.doReducer(reducer, this.getContextState(), payload)
          }
        }
      }
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

  setStatus (status, el) {
    this.status = status
    this.addMaskLayer({
      el: el || this.el,
      name: status,
      className: 'status-' + status
    })
  }

  removeStatus (status, el) {
    if (this.status === status) {
      this.status = null
      this.removeMaskLayer(status, el || this.el)
    }
  }

  removeMaskLayer (name, el) {
    if (el && el.querySelector('[name="' + name + '"]')) {
      el.removeChild(el.querySelector('[name="' + name + '"]'))
    }
  }

  addMaskLayer ({
    el,
    name,
    zIndex,
    className,
    text,
    content
  }) {
    if (!el) {
      return
    }
    if (el.querySelector('[name="' + name + '"]')) {
      return
    }
    const layer = document.createElement('div')

    layer.setAttribute('name', name)

    layer.classList.add('ridge-overlay')

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
    el.insertBefore(layer, el.firstChild)
  }

  /**
     * 组件配置信息发生改变
     * @param {*} values
     * @param {*} field
     */
  setPropsConfig (values, field) {
    for (const keyPath of Object.keys(field)) {
      const [type, key] = keyPath.split('.')

      if (type === 'props') {
        Object.assign(this.config.props, {
          [key]: field[keyPath]
        })
        Object.assign(this.properties, {
          [key]: field[keyPath]
        })
      }
      if (type === 'style') {
        Object.assign(this.config.style, {
          [key]: field[keyPath]
        })
      }

      // 动态属性
      if (type === 'propsEx') {
        if (field[keyPath] == null) {
          delete this.config.propEx[key]
        } else {
          Object.assign(this.config.propEx, {
            [key]: field[keyPath]
          })
        }
      }
      // 动态样式
      if (type === 'styleEx') {
        if (field[keyPath] == null) {
          delete this.config.styleEx[key]
        } else {
          Object.assign(this.config.styleEx, {
            [key]: field[keyPath]
          })
        }
      }

      if (keyPath === 'title') {
        this.config.title = field[keyPath]
      }
    }

    this.updateStyle()
    this.renderUpdate()
  }

  setConfigLocked (locked) {
    this.config.style.locked = locked
    this.style.locked = locked

    if (locked) {
      this.el.classList.add('is-locked')
    } else {
      this.el.classList.remove('is-locked')
    }
  }

  setConfigVisible (visible) {
    this.config.style.visible = visible
    this.el.style.visibility = visible ? 'visible' : 'hidden'
  }

  setEventsConfig (values, update) {
    Object.assign(this.config.events, values.event)
  }

  /**
     * 获取封装层样式，包括  x/y/width/height/visible/rotate
     * @returns
     */
  getStyle () {
    return this.config.style
  }

  getChildrenIds () {
    return this.config.props.children || []
  }

  /**
     * 计算获取插槽子元素
     * @returns Array 元素列表
     */
  getSlotChildren () {
    if (this.slotProps) {
      return this.slotProps.map(prop => {
        return {
          name: prop,
          element: this.config.props[prop]
        }
      })
    } else {
      return []
    }
  }

  getConfigurableProps () {
    return [...this.componentDefinition.props, ...(this.parentWrapper?.componentDefinition?.childProps || [])]
  }

  toJSON () {
    if (this.config.props.children && this.config.props.children[0] && this.config.props.children[0].id) {
      debugger
    }
    return JSON.parse(JSON.stringify(this.config))
  }
}

export default ElementWrapper
