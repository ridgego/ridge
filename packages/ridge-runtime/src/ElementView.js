/* eslint-disable max-len */
import template from './template.js'
import debug from 'debug'
import { nanoid } from 'nanoid'
const log = debug('runtime:fc-view')
const captureEvents = ['onclick', 'ondblclick', 'onmouseup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseenter', 'onmouseover', 'oncontextmenu']

/**
 * 组件加载、渲染管理类
 * - 每个图元都有一个对应的ElementView实例封装
 * - 通过 fcViewManager.getComponentView 方式获取实例
 * @class
 */
class ElementView {
  /**
     * @prop {String} fcId 组件ID
     * @prop {String} pageId 组件所在页面ID
     * @prop {Object} instancePropConfig 组件配置实例，这个属性也是最终传递给React/Vue组件的属性 （React组件还包括了事件属性）.另外还包含了一些组件未声明的系统属性，也可以在组件中使用的，一般用于系统级组件。普通组件注意不要和系统属性重名即可
     * @prop {Object} instancePropConfig.$$apolloApp 平台服务对象，包括了
     * @prop {Object} instancePropConfig.$$apolloApp.appSetting -应用配置
     * @prop {function} instancePropConfig.$$apolloApp.setAppState -设置应用状态
     * @prop {FCView} instancePropConfig.$$apolloApp.viewManager -视图管理器实例
     * @prop {Object} instancePropConfig.$$contextVariables - 组件收到的应用上下文数据。当组件上定义表达式时，上面引用的变量值都以这个为准
     * @prop {Object} instancePropConfig.$$scopeVariables - 组件收到的scope上下文数据。当组件上定义表达式时，这个变量以$scope形式提供，一般用于列表等循环情况下的范围数据
     * @prop {FCView} instancePropConfig.$$currentFcView - self 当前组件管理类
     * @prop {Boolean} instancePropConfig.$$isRuntime - 值为true  组件可以判断当前渲染的就在运行时
     * @prop {Object} componentDefinition - 组件的fcp定义信息
     * @prop {Object} fcInstanceConfig 组件配置数据信息
     * @prop {DOMElement} el - 组件mount到的HTML Element元素
     * @prop {Object.<string, function>} eventCallbacks 组件的事件回调信息。
     * @param {Loader} loader 加载器
     */
  constructor ({ el, packageName, path, viewConfig, loader, context, preloadChild, decorators }) {
    this.uuid = nanoid(10)
    this.fcInstanceConfig = viewConfig || {}
    this.fcId = this.fcInstanceConfig.guid || nanoid(6)
    this.el = el
    this.loader = loader
    this.packageName = packageName
    this.path = path

    this.context = context
    // 默认值
    this.defaultProps = this.fcInstanceConfig.props
    // 默认属性配置信息
    this.instancePropConfig = Object.assign({}, this.fcInstanceConfig.props)
    // 回调列表
    this.eventCallbacks = {}
    // 定义在元素上的原始事件
    this.domEvents = []
    // 回调最近一次传出的数据信息
    this.eventPayloadStack = {}
    // 加载标志
    this.loaded = false
    // 加载的子组件
    this.childrenFcViews = []
    // 模板元素的节点
    this.slotFcViews = {}
    // 设置加载时是否同时加载子节点
    this.preloadChild = preloadChild

    // 是否进行数据请求
    this.isQuerying = false
    // 组件视图渲染器
    this.decorators = decorators
  }

  /**
     * 加载前端组件代码、初始化属性、并渲染到指定的DOM节点
     * @param el 渲染的目标节点
     * @returns {Promise<void>}
     */
  async loadAndRender (el) {
    await this.loadComponentDefinition()
    await this.initChildViews()
    this.initPropsAndEvents()
    this.mount(el || this.el)
  }

  /**
     * 加载组件定义信息（fcp），同时根据fcp下载组件的执行代码。
     * 任何组件必须调用此方法后才能执行后续处理。 在loadAndRender中会自动调用
     */
  async loadComponentDefinition () {
    if (this.loaded) {
      return
    }

    log('loadComponentDefinition', this.fcInstanceConfig)

    // 加载组件定义信息
    if (this.packageName && this.path) {
      const componentDefinition = await this.loader.loadComponent({
        packageName: this.packageName,
        path: this.path
      })

      if (!componentDefinition || !componentDefinition.factory) {
        log('加载图元失败: 未获取组件', this.fcInstanceConfig)
        return
      }
      this.componentDefinition = componentDefinition

      // 枚举组件定义属性，加载相关的字体资源
      for (const prop of this.componentDefinition.props || []) {
        // 字体类型属性，并且指定了值
        if (prop.control === 'font-dropdown' && this.instancePropConfig[prop.name]) {
          log('加载字体', this.instancePropConfig[prop.name])
          await this.loader.loadFont(null, this.instancePropConfig[prop.name])
        }
      }
    }

    if (this.fcInstanceConfig.slotElements) {
      for (const prop in this.fcInstanceConfig.slotElements) {
        const fcInstanceConfig = this.fcInstanceConfig.slotElements[prop]
        const slotFcView = new ElementView({
          decorators: this.decorators,
          fcInstanceConfig,
          loader: this.loader,
          apolloApp: this.apolloApp,
          contextVariables: this.contextVariables,
          preloadChild: this.preloadChild,
          scopeVariables: this.scopeVariables,
          pageId: this.pageId
        })

        // 插槽及以下组件必须提前加载，因为很多弹层、下拉的场合如果展示了才加载会造成页面中断
        slotFcView.isSlot = true
        await slotFcView.loadComponentDefinition()
        await slotFcView.initChildViews()

        this.slotFcViews[prop] = slotFcView
      }
    }
    try {
      Object.values(this.decorators).forEach(decorator => decorator.loaded(this, this.componentDefinition))
    } catch (e) {
      console.error('Decorator Error', e)
    }

    this.loaded = true
  }

  async initChildViews () {
    // 直接从布局设置了若干子节点
    if (this.childrenFcViews.length === 0) {
      for (const children of this.fcInstanceConfig.children || []) {
        log('加载组件的子节点', children)
        const childView = new ElementView({
          fcInstanceConfig: children,
          loader: this.loader,
          apolloApp: this.apolloApp,
          contextVariables: this.contextVariables,
          scopeVariables: this.scopeVariables,
          preloadChild: this.preloadChild,
          decorators: this.decorators,
          pageId: this.pageId
        })

        childView.pageId = this.pageId

        if (this.isSlot) {
          await childView.loadComponentDefinition()
        }

        if (this.preloadChild) {
          await childView.loadComponentDefinition()
        }

        await childView.initChildViews()

        this.childrenFcViews.push(childView)
      }
    }
  }

  /**
     * 复制当前组件实例， 这个方法主要用于列表类型的组件复制列表项的场景
     * @returns null
     */
  cloneView () {
    const fcv = new ElementView({
      decorators: this.decorators,
      fcInstanceConfig: this.fcInstanceConfig,
      loader: this.loader,
      apolloApp: this.apolloApp,
      preloadChild: this.preloadChild,
      contextVariables: this.contextVariables,
      pageId: this.pageId
    })

    fcv.componentDefinition = this.componentDefinition

    // 克隆子节点信息
    if (this.childrenFcViews) {
      fcv.childrenFcViews = this.childrenFcViews.map(v => v.cloneView())
    }

    // 克隆slot节点信息
    for (const slotKey in this.slotFcViews) {
      fcv.slotFcViews[slotKey] = this.slotFcViews[slotKey].cloneView()
    }
    log('复制组件完成', fcv)
    return fcv
  }

  /**
     * 递归 设置、更新子节点数据信息
     */
  setScopeVariables (scopeVariables) {
    this.scopeVariables = scopeVariables

    for (const childFcView of this.childrenFcViews) {
      childFcView.setScopeVariables(scopeVariables)
    }
  }

  setScopeVariable (key, value) {
    this.scopeVariables[key] = value

    for (const childFcView of this.childrenFcViews) {
      childFcView.setScopeVariable(key, value)
    }
  }

  isBlockFcView () {
    return this.fcInstanceConfig.packageName == null && this.fcInstanceConfig.path == null
  }

  /**
     * 初始化图元的属性和事件
     * @param {Object} variables 页面变量信息
     */
  initPropsAndEvents (variables) {
    if (variables) {
      this.contextVariables = variables
    }
    // 设置回写属性值的事件
    this.propertyWriteBackEvents = {}
    // 枚举、处理所有属性定义
    for (const prop of this.componentDefinition.props || []) {
      // 默认值次序： 控件实例化给的默认值 -> 组态化定义的默认值 -> 前端组件的默认值 (这个不给就用默认值了)
      if (this.instancePropConfig[prop.name] == null && prop.value != null) {
        this.instancePropConfig[prop.name] = prop.value
        // 多语言处理：对于默认值未给到组件翻译的情况
        if (typeof this.instancePropConfig[prop.name] === 'string' && prop.value !== '' && prop.i18n === true) {
          this.instancePropConfig[prop.name] = this.apolloApp.viewManager.getI18nText(this.instancePropConfig[prop.name]) || this.instancePropConfig[prop.name]
        }
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
      if (this.fcInstanceConfig.reactiveProps && this.fcInstanceConfig.reactiveProps[prop.name]) {
        const context = Object.assign({}, this.contextVariables, {
          $scope: this.scopeVariables
        })

        try {
          this.instancePropConfig[prop.name] = template(this.fcInstanceConfig.reactiveProps[prop.name], context)
        } catch (e) {
          this.instancePropConfig[prop.name] = null
        }
      }
    }

    // 处理组件双向绑定
    if (this.interactHandler) {
      this.interactHandler.attachInteractTo(this)
    }

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
    for (const interaction of (this.fcInstanceConfig.in || [])) {
      if (!this.instancePropConfig[interaction.event.name]) {
        this.instancePropConfig[interaction.event.name] = (...args) => {
          this.emit(interaction.event.name, ...args)
        }
      }
    }

    // 写入插槽信息
    for (const slotProp in this.slotFcViews) {
      this.instancePropConfig[slotProp] = this.slotFcViews[slotProp]
    }

    this.instancePropConfig.__elementView = this

    this.editorFeatures = this.componentDefinition.editorFeatures ?? {}

    try {
      Object.values(this.decorators).forEach(decorator => decorator.initPropEvents(this))
    } catch (e) {
      console.error('Decorator initPropEvents Error', e)
    }
  }

  setQuerying (isQuery) {
    if (isQuery && this.fcInstanceConfig.showLoading) {
      this.setLoading(true)
    }
  }

  /**
     * @description: 根据组件交互事件类型判断鼠标样式
     * @param {*} props
     * @param {*} el
     * @return {*}
     */
  checkFcViewEvents (props, el) {
    if (props && props.length > 0) {
      const isCursorPointer = props.some(item =>
        (item.event.name === 'onclick' ||
                item.event.name === 'ondblclick' ||
                item.event.name === 'oncontextmenu' ||
                item.event.name === 'onmousedown' ||
                item.event.name === 'onmouseenter' ||
                item.event.name === 'onmouseover') &&
                item.actions.length > 0)

      if (isCursorPointer) {
        el.style.cursor = 'pointer'
      }
    } else if (typeof props === 'undefined') {
      el.style.cursor = 'default'
    }
  }

  /**
     * 检查属性是否包括数据绑定的更新
     * @param {*} props
     */
  containsDBProps (props) {
    if (this.fcInstanceConfig && this.fcInstanceConfig.db) {
      const dbKeys = Object.keys(this.fcInstanceConfig.db)

      for (const propName of dbKeys) {
        if (Object.prototype.hasOwnProperty.call(props, propName)) {
          return true
        }
      }
    }
    return false
  }

  /**
     * 处理组件引用了其他组件的情况
     * @param {*} fcViewsMap
     */
  initLink (fcViewsMap) {
    if (this.componentDefinition) {
      let linkUpdated = false

      for (const prop of this.componentDefinition.props ?? []) {
        // 属性定义为多个图元的引用
        if (prop.isRef === true) {
          const fcIds = this.instancePropConfig[prop.name]

          this.instancePropConfig[prop.name] = []

          for (const id of fcIds) {
            linkUpdated = true
            this.instancePropConfig[prop.name].push(fcViewsMap[id])
          }
        }
      }
      if (linkUpdated) {
        this.updateProps()
      }
    }
  }

  /**
     * 获取节点下所有的子布局节点
     * @returns {Array} 子节点FCView列表
     */
  getLayoutChildrenViews () {
    let result = []

    if (this.childrenFcViews) {
      result = result.concat(this.childrenFcViews)

      for (const fcView of this.childrenFcViews) {
        result = result.concat(fcView.getLayoutChildrenViews())
      }
    }

    // slot同时也作为子节点
    // TODO 这个未来还是要区分 slot内容是否是模板
    if (this.slotFcViews && Object.values(this.slotFcViews).length) {
      for (const slotFcView of Object.values(this.slotFcViews)) {
        result.push(slotFcView)
        result = result.concat(slotFcView.getLayoutChildrenViews())
      }
    }
    return result
  }

  /**
     * 执行组件初次加载 mount到具体DOM元素
     */
  mount (el, noRetry) {
    if (!el) {
      console.error('No Element to Mount')
    }

    // 检测到需要为DOM绑定事件，则在此处绑定
    // !!!! 事件的回调已经统一注册到 this.eventCallbacks 之中了， 当emit时按名称会调用事件
    if (this.domEvents.length) {
      for (const eventName of this.domEvents) {
        this.attachElEvent(el, eventName)
      }
    }

    try {
      // 判断组件交互事件类型添加鼠标悬浮状态
      this.checkFcViewEvents(this.fcInstanceConfig.in, el)

      log('mount with', this.fcInstanceConfig.guid, this.instancePropConfig)

      // 更新所有动态属性
      Object.assign(this.instancePropConfig, this.evaluateReactiveProps())
      this.convertPropTypes(this.instancePropConfig, this.componentDefinition.props)
      this.renderer = this.componentDefinition.factory.mount(el, this.instancePropConfig)
      try {
        Object.values(this.decorators).forEach(decorator => decorator.mounted(this))
      } catch (e) {
        console.error('Decorator Mount Error', e)
      }
    } catch (e) {
      // 一些因干扰异常产生的组件渲染问题处理：重试一次
      if (!noRetry) {
        setTimeout(() => {
          this.mount(el, true)
        }, 100)
      } else {
        if (localStorage.fcview === 'debug') {
          this.el.innerHTML = this.fcInstanceConfig.packageName + '@' + this.fcInstanceConfig.version + '/' + this.fcInstanceConfig.path + '<br>' + e
        }
        log('fc mount error', this.fcInstanceConfig.guid, this, e)
      }
    }

    // 对于设置了显隐的情况，就进行一次显示处理
    if (this.fcInstanceConfig.reactiveBuildInProps && this.fcInstanceConfig.reactiveBuildInProps.visible) {
      const isVisible = template(this.fcInstanceConfig.reactiveBuildInProps.visible, this.getVariableContext())

      if (isVisible === 'false' || isVisible === false) {
        // 更新显示
        this.setVisible(false)
      } else {
        this.setVisible(true)
      }
    } else {
      this.setVisible(this.visible)
    }
  }

  async relativeContainerMount (el) {
    if (el) {
      this.el = el
    }
    if (this.el.style.position !== 'absolute') {
      this.el.style.position = 'relative'
    }
    this.el.style.background = ''

    for (const childView of this.childrenFcViews) {
      const div = document.createElement('div')

      div.style.position = 'absolute'
      div.style.background = 'rgba(255, 255, 255, .2)'

      div.style.left = (childView.fcInstanceConfig.x - this.fcInstanceConfig.x) + 'px'
      div.style.top = (childView.fcInstanceConfig.y - this.fcInstanceConfig.y) + 'px'

      div.style.width = (100 * childView.fcInstanceConfig.width / this.fcInstanceConfig.width) + '%'
      div.style.height = (100 * childView.fcInstanceConfig.height / this.fcInstanceConfig.height) + '%'

      this.el.appendChild(div)

      childView.el = div
      await childView.loadAndRender()
    }
    this.setVisible(this.visible)
  }

  evaluateReactiveProps () {
    const props = {}

    // 更新所有动态属性
    for (const reactiveProp in this.fcInstanceConfig.reactiveProps) {
      props[reactiveProp] = template(this.fcInstanceConfig.reactiveProps[reactiveProp], this.getVariableContext())
    }
    return props
  }

  patchProps (props) {
    // 合并更新值
    Object.assign(this.instancePropConfig, props)
    this.renderer.updateProps(this.instancePropConfig)
  }

  /**
     * 更新组件属性信息，更新属性时同时执行以下操作
     * - 数据类型转换
     * - 更新所有计算类型的属性
     * - 更新组件的显示/隐藏
     * @param {Object} props 要更新的属性（不需要所有属性，只需要传入需要更新的属性）
     * @param {Object} variables 新的页面变量信息
     */
  updateProps (props) {
    this.instancePropConfig.contextVariables = this.contextVariables

    // 合并更新值
    Object.assign(this.instancePropConfig, this.evaluateReactiveProps(), props)

    if (this.renderer) {
      try {
        log('updateProps', this.fcId, this.instancePropConfig)
        try {
          Object.values(this.decorators).forEach(decorator => decorator.updateProps(this))
        } catch (e) {
          console.error('Decorator updateProps Error', e)
        }
        for (const key of Object.keys(props || {})) {
          // 设置null时如果组件给了默认值， 则设置为默认值
          if (props[key] == null && this.defaultProps[key] != null) {
            this.instancePropConfig[key] = this.defaultProps[key]
          }
        }
        this.convertPropTypes(this.instancePropConfig, this.componentDefinition.props)
        this.renderer.updateProps(this.instancePropConfig)
      } catch (e) {
        log('用属性渲染组件出错', this.fcInstanceConfig.guid, this.instancePropConfig, this)
      }
    } else {
      log('updateProps umounted', this.fcId, this.instancePropConfig)
    }

    this.updateVisibles()
    if (props && this.containsDBProps(props)) {
      this.emit('ondataload', props)
    }
  }

  /**
     * 检查 this.fcInstanceConfig.reactiveBuildInProps.visible 的动态配置， 如果有，执行一次显隐计算。
     */
  updateVisibles () {
    if (this.fcInstanceConfig && this.fcInstanceConfig.reactiveBuildInProps && this.fcInstanceConfig.reactiveBuildInProps.visible) {
      const visible = template(this.fcInstanceConfig.reactiveBuildInProps.visible, this.getVariableContext())

      // 当用模板方式计算 （返回值 'false'） 也判断为否
      if (visible === 'false' || visible === false) {
        // 更新显示
        this.setVisible(false)
      } else {
        this.setVisible(true)
      }
    }
  }

  /**
     * 属性按照类型定义进行转换处理
     * @param {*} props 属性对象值
     * @param {*} definition 属性定义
     * @returns {Object} 转换后的对象
     */
  convertPropTypes (props, definition) {
    for (const propDefinition of definition) {
      // 对于定义的属性有值，进行按类型的自字符串的转换处理
      if (typeof props[propDefinition.name] === 'string' && propDefinition.type !== 'string') {
        switch (propDefinition.type) {
          case 'boolean':
            if (props[propDefinition.name] === 'false' || props[propDefinition.name] === '0' || props[propDefinition.name] === '') {
              props[propDefinition.name] = false
            } else {
              props[propDefinition.name] = Boolean(props[propDefinition.name])
            }
            break
          case 'object':
          case 'array':
            try {
              props[propDefinition.name] = JSON.parse(props[propDefinition.name])
            } catch (e) {
              // 只是尝试转换 失败了保持旧值
            }
            break
          case 'number':
            props[propDefinition.name] = Number(props[propDefinition.name])
            break
          default:
            break
        }
      }
    }
    return props
  }

  /**
     * 调用组件定义的方法
     * @param {*} method
     * @param {*} args
     */
  invoke (method, args) {
    log('invoke', this.fcId, method)
    return this.renderer.invoke(method, args)
  }

  /**
     * 设置切换组件是否可见
     * @param visible
     */
  setVisible (visible) {
    this.visible = visible
    if (this.el) {
      if (visible === false) {
        this.el.style.display = 'none'
      }
    }
  }

  getVisible () {
    if (this.el.style.display === 'none') {
      return false
    } else {
      return true
    }
  }

  /**
     * 设置加载状态
     * @param {*} isLoading
     */
  setLoading (isLoading) {
    if (this.el) {
      if (isLoading) {
        let loadingEl = document.querySelector('#loading-' + this.uuid)

        if (!loadingEl) {
          loadingEl = document.createElement('div')
          loadingEl.id = 'loading-' + this.uuid
        }

        loadingEl.className = 'cover-spin'

        loadingEl.innerHTML = '数据请求中'

        if (this.el.style.position !== 'absolute') {
          this.el.style.position = 'relative'
        }
        this.el.appendChild(loadingEl)
      } else {
        const loadingEl = document.querySelector('#loading-' + this.uuid)

        if (loadingEl) {
          this.el.removeChild(loadingEl)
        }
      }
    }
  }

  /**
     * 设置更改节点位置
     * @param x
     * @param y
     */
  setPosition ({ x, y }) {
    if (x) {
      this.el.style.left = x + 'px'
    }
    if (y) {
      this.el.style.top = y + 'px'
    }
  }

  /**
     * 快捷设置组件的值
     * @param {Object} value 设置的值
     */
  val (value) {
    this.updateProps({
      [this.inputPropKey]: value
    })
  }

  /**
     * 获取所有的组件绑定信息
     */
  getEventBindings () {
    return {}
  }

  /**
     * 发出、并调用callbak相关回调
     * @param {String} event 事件名称
     * @param {Object} payload 事件参数
     */
  emit (event, payload) {
    if (this.eventCallbacks[event]) {
      try {
        this.eventCallbacks[event](payload)
      } catch (e) {
        console.error('事件处理异常', event, payload, e)
      }
    } else {
      // 缓存最近一次参数，当 on 注册时可以直接调用
      this.eventPayloadStack[event] = payload
    }
  }

  getPropDefination (name) {
    if (this.componentDefinition && this.componentDefinition.props) {
      const propDef = this.componentDefinition.props.filter(prop => prop.name === name)[0]

      return propDef
    } else {
      return null
    }
  }

  /**
     * 直接绑定inpu事件的回调
     * @param {Function} callback
     */
  input (callback) {
    this.eventCallbacks.input = callback
  }

  /**
     * 设置事件回调
     * @param {String} event 事件名称
     * @param {Function} callback 回调方法
     */
  on (event, callback) {
    // 设置系统事件的回调
    if (captureEvents.indexOf(event.toLocaleLowerCase()) > -1) {
      if (this.el) {
        this.attachElEvent(this.el, event.toLocaleLowerCase(), callback)
      } else {
        this.domEvents.push(event.toLocaleLowerCase())
      }
    }
    this.eventCallbacks[event] = callback
    // eslint-disable-next-line no-prototype-builtins
    if (this.eventPayloadStack.hasOwnProperty(event)) {
      try {
        callback(this.eventPayloadStack[event])
      } catch (e) {
        log('回调处理异常', event, this.eventPayloadStack[event], e)
      } finally {
        delete this.eventPayloadStack[event]
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
        this.emit(eventName, this.instancePropConfig)
        event.stopPropagation()
      } catch (e) {
        console.error('事件处理异常', e)
      }
      return false
    }
  }

  /**
     * 取消组件挂载。 可用于页面销毁，后续页面重新打开重新mount即可
     */
  unmount () {
    if (this.childrenFcViews && this.childrenFcViews.length) {
      for (const childFcView of this.childrenFcViews) {
        childFcView.unmount()
      }
    }

    if (this.slotFcViews && this.slotFcViews.length) {
      for (const slotFcView of this.slotFcViews) {
        slotFcView.unmount()
      }
    }

    // 回调内容清空
    this.eventPayloadStack = {}

    if (this.el && this.renderer) {
      this.renderer.destroy()
      this.renderer = null
    }

    try {
      Object.values(this.decorators).forEach(decorator => decorator.unmount(this))
    } catch (e) {
      console.error('Decorator unmount Error', e)
    }
  }

  /**
     * 获取当前组件可见的上下文变量信息
     */
  getVariableContext () {
    return Object.assign({},
      // 页面上下文变量
      this.contextVariables, {
        // 局部包上下文
        $scope: this.scopeVariables,
        // 应用变量
        app: this.apolloApp.viewManager.appVariableObject
      })
  }

  /**
     * 删除DOM上所有事件并清除div
     */
  destory () {
    this.renderer.destroy()
    if (this.el && this.el.parentElement) {
      this.el.parentElement.removeChild(this.el)
    }
  }
}

export default ElementView
