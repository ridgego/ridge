import debug from 'debug'
import ReactRenderer from '../render/ReactRenderer'
import VanillaRender from '../render/VanillaRenderer'
import template from '../utils/template'
import { trim, nanoid } from '../utils/string'
const log = debug('ridge:element')

const error = debug('ridge:error')
const log_edit = debug('ridge:editor:element')

/**
 * 组件封装类
 */
class ElementWrapper {
  constructor ({
    config,
    mode,
    pageManager
  }) {
    this.config = config
    this.id = config.id
    this.componentPath = config.path

    this.pageManager = pageManager
    this.pageStore = pageManager.pageStore
    this.mode = mode

    // 系统内置属性
    this.systemProperties = {
      __pageManager: pageManager,
      __elementWrapper: this,
      __mode: mode
    }
    // 存放计算值、运行时配置更新值
    this.properties = {}
    // 局部状态
    this.scopeState = {}
  }

  isRoot () {
    return this.config.parent == null
  }

  /**
   * 复制组件实例
   * @returns
   */
  clone () {
    const cloned = new ElementWrapper({
      config: this.toJSON(),
      pageManager: this.pageManager,
      mode: this.mode
    })
    cloned.cloneFrom = cloned.id
    cloned.id = nanoid(10)

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
    }
  }

  appendChild (wrapper) {
    this.children.push(wrapper)
  }

  /**
   * 初始化组件属性、事件
   */
  initPropsAndEvents () {
    this.slotProps = []

    if (this.config.parent && !this.parentWrapper) {
      this.parentWrapper = this.pageManager.getElement(this.config.parent)
    }

    // 枚举、处理所有属性定义
    for (const prop of this.componentDefinition.props || []) {
      // 编辑器初始化创建时给一次默认值
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

      if (prop.name === 'children') {
        this.children = []
        this.isContainer = true
        this.el.classList.add('container')

        // 写入子级的具体包装类
        if (Array.isArray(this.config.props.children)) {
          this.config.props.children = this.config.props.children.map(element => {
            if (typeof element === 'string') {
              return this.pageManager.getElement(element)
            } else {
              return element
            }
          }).filter(child => child)
        }
      } else if (prop.type === 'slot') {
        this.isContainer = true
        this.slotProps.push(prop.name)
        // 写入slot的包装类
        if (this.config.props[prop.name] && typeof this.config.props[prop.name] === 'string') {
          this.config.props[prop.name] = this.pageManager.getElement(this.config.props[prop.name])
        }
      }
    }
    // 事件类属性写入，DOM初始化后事件才能挂到源头
    for (const event of this.componentDefinition.events || []) {
      this.properties[event.name] = (...args) => {
        this.emit(event.name, ...args)
      }
    }
    if (this.mode !== 'edit') {
      this.updateExpressionedProperties()
      // TODO 检查动态绑定的情况，按需对store变化进行响应
      if (Object.keys(this.config.styleEx).length || Object.keys(this.config.propEx).length) {
        this.pageStore.subscribe(this.id, () => {
          this.forceUpdate()
        })
      }
    }
    delete this.config.isNew
  }

  isMounted () {
    return this.el != null
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
        this.initPropsAndEvents()
        this.renderer = this.createRenderer()
      })
    } else {
      this.initPropsAndEvents()
      this.renderer = this.createRenderer()
    }
  }

  unmount () {
    if (this.children && this.children.length) {
      for (const childWrapper of this.children) {
        childWrapper.unmount()
      }
    }
    if (this.renderer) {
      this.renderer.destroy()
      this.renderer = null
    }
    if (this.el) {
      this.el.parentElement.removeChild(this.el)
      this.el = null
    }
    if (this.mode !== 'edit') {
      this.pageStore.unsubscribe(this.id)
    }
  }

  /**
   * 调用组件依托的技术框架渲染内容
   * @returns
   */
  createRenderer () {
    try {
      if (this.componentDefinition.type === 'vanilla') {
        return new VanillaRender(this.componentDefinition.component, this.el, this.getProperties())
      } else {
        return new ReactRenderer(this.componentDefinition.component, this.el, this.getProperties())
      }
    } catch (e) {
      error('create render error', e)
    }
    return null
  }

  getProperties () {
    return Object.assign({}, this.config.props, this.systemProperties, this.properties)
  }

  forceUpdateStyle () {
    if (this.el) {
      Object.assign(this.el.style, this.config.style)
      if (this.config.props.coverContainer) {
        this.el.style.width = '100%'
        this.el.style.height = '100%'
        this.el.style.position = 'absolute'
        this.el.style.left = 0
        this.el.style.transform = ''
        this.el.style.top = 0
      } else {
        this.el.style.width = this.config.style.width ? (this.config.style.width + 'px') : ''
        this.el.style.height = this.config.style.height ? (this.config.style.height + 'px') : ''
        this.el.style.position = this.config.style.position
        if (this.config.style.position === 'absolute') {
          this.el.style.left = 0
          this.el.style.top = 0
          this.el.style.transform = `translate(${this.config.style.x}px, ${this.config.style.y}px)`
        } else {
          this.el.style.transform = ''
        }
      }

      if (this.mode !== 'edit') {
        this.el.style.visibility = this.config.style.visible ? 'visible' : 'hidden'
        for (const styleName of Object.keys(this.config.styleEx || {})) {
          const value = template(this.config.styleEx[styleName], this.getContextState())
          if (styleName === 'width') {
            this.el.style.width = value + 'px'
          }
          if (styleName === 'visible') {
            this.el.style.visibility = value ? 'visible' : 'hidden'
          }
        }
      } else {
        this.el.style.visibility = 'visible'
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

  setScopeStateValues (state) {
    this.scopeState = Object.assign({}, state)
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
   * 强制重新计算属性并更新组件显示
   */
  async forceUpdateProps () {
    if (this.mode !== 'edit') {
      this.updateExpressionedProperties()
    }
    console.log('forceUpdate', this.properties)
    await this.updateProperties()
  }

  /**
   * 强制更新、计算所有属性
   */
  async forceUpdate () {
    this.forceUpdateStyle()
    this.forceUpdateProps()
  }

  /**
   * 计算所有表达式值
   */
  updateExpressionedProperties () {
    for (const [key, value] of Object.entries(this.config.propEx)) {
      if (value == null || value === '') {
        continue
      }
      if (log.enabled) {
        log('Prop Bind Update', this.id + '[' + this.config.title + ']', key, value)
      }
      this.properties[key] = this.getExpressionValue(value)
    }
  }

  getExpressionValue (expression) {
    const state = this.pageStore.ctx.state[expression]
    if (state) {
      // 直接绑定值
      if (typeof state === 'function') {
        if (log.enabled) {
          log('computed state', state, this.getContextState())
        }
        return state(this.getContextState())
      } else {
        return this.pageManager.pageStore.ctx.stateValue[expression]
      }
    } else {
      return template(expression, {
        ...this.pageManager.pageStore.ctx.stateValue
      })
    }
  }

  hasExpression (propBindKey) {
    return this.config.propEx[propBindKey] !== '' && this.config.propEx[propBindKey] != null
  }

  invoke (method, args) {
    return this.renderer.invoke(method, args)
  }

  /**
   * 组件根据对应变量变化进而进行重新布局或渲染
   * @param {*} variableNames 变动的变量Key
   */
  reactBy (variableNames) {
    if (this.configUseVariable(this.config.propEx, variableNames)) {
      this.forceUpdateProps()
    }
    if (this.configUseVariable(this.config.styleEx, variableNames)) {
      this.forceUpdateStyle()
    }
  }

  configUseVariable (config, variableNames) {
    let used = false
    for (const expression of Object.values(config)) {
      if (used) break

      for (const variableName of variableNames) {
        if (expression.indexOf(variableName) > -1) {
          used = true
        }
      }
    }
    return used
  }

  emit (eventName, payload) {
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
        if (action.name === 'setState') {
          try {
            const context = Object.assign({}, this.getContextState(), { payload })
            const newStateValue = template(action.value, context)
            this.pageStore.setState({
              [action.target]: newStateValue
            })
          } catch (e) {
            log('Event Action[setvar] Error', e)
          }
        }
      }
    }
  }

  /**
   * 应用拦截器的拦截方法（异步）
   * @param {*} hookName
   */
  async applyDecorate (hookName) {
    if (this.pageManager && this.pageManager.decorators.element) {
      for (const decorator of this.pageManager.decorators.element) {
        try {
          decorator[hookName] && await decorator[hookName](this)
        } catch (e) {}
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
    el.appendChild(layer)
  }

  /**
   * 修改组件配置的样式信息
   * @param {*} style
   */
  setStyle (style) {
    if (style.hasOwnProperty('flex') && style.flex == null) {
      style.flex = ''
    }
    Object.assign(this.config.style, style)

    this.forceUpdateStyle()
  }

  /**
     * 组件配置信息发生改变，通过编辑器配置面板传入
     * @param {*} values
     * @param {*} field
     */
  setPropsConfig (values, field) {
    log_edit(this, field)
    for (const keyPath of Object.keys(field)) {
      const [type, key] = keyPath.split('.')

      if (type === 'props') {
        Object.assign(this.config.props, {
          [key]: field[keyPath]
        })
      }
      if (type === 'style') {
        this.setStyle({
          [key]: field[keyPath]
        })
      }
      if (type === 'propsEx') {
        Object.assign(this.config.propEx, {
          [key]: field[keyPath]
        })
      }
      if (type === 'styleEx') {
        Object.assign(this.config.styleEx, {
          [key]: field[keyPath]
        })
      }

      if (keyPath === 'title') {
        this.config.title = field[keyPath]
      }
    }
    this.forceUpdateStyle()

    // 编辑时忽略动态配置的属性、事件
    this.applyDecorate('setPropsConfig').then(() => {
      this.forceUpdateProps()
    })
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
    if (this.isContainer) {
      const result = Object.assign({}, this.config)
      result.props = Object.assign({}, this.config.props)

      // 保存时children及slotProp只保存id
      if (this.config.props.children) {
        result.props.children = this.config.props.children.filter(n => n).map(child => child.id)
      }

      for (const key of this.slotProps ?? []) {
        if (result.props[key]) {
          result.props[key] = result.props[key].id
        }
      }
      return JSON.parse(JSON.stringify(result))
    } else {
      return JSON.parse(JSON.stringify(this.config))
    }
  }
}

export default ElementWrapper
