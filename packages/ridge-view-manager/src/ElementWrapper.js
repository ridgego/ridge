import debug from 'debug'
import template from './template'
const log = debug('ridge:el-wrapper')

class ElementWrapper {
  constructor ({
    el,
    context,
    componentPath,
    componentConfig
  }) {
    this.el = el
    this.componentPath = componentPath
    this.componentConfig = componentConfig
    this.loader = context.loader
    this.context = context

    // 组件（React/Vue）收到的属性数据
    this.instancePropConfig = componentConfig.props
  }

  setWrapperStyle (style) {
    Object.assign(this.el.style, style)
  }

  async loadAndInitialize (el) {
    if (this.componentConfig.position) {
      this.el.className = 'ridge-element'
      this.el.style.position = 'absolute'
      this.el.style.width = this.componentConfig.position.width + 'px'
      this.el.style.height = this.componentConfig.position.height + 'px'
      this.el.style.transform = `translate(${this.componentConfig.position.x}px, ${this.componentConfig.position.y}px)`
    }
    await this.loadComponentDefinition()
    this.initPropsAndEvents()
    this.mount(el ?? this.el)
  }

  async loadComponentDefinition () {
    if (this.componentDefinition) {
      return
    }

    // 加载组件定义信息
    if (this.componentPath) {
      this.setStatus('loading')
      const componentDefinition = await this.loader.loadComponent(this.componentPath)

      if (!componentDefinition || !componentDefinition.factory) {
        log('加载图元失败: 未获取组件', this.componentPath)
        return
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
      this.componentDefinition = componentDefinition
    }

    try {
      this.context && this.context.emit('component-loaded', this)
    } catch (e) {
      //
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
      // 默认值次序： 控件实例化给的默认值 -> 组态化定义的默认值 -> 前端组件的默认值 (这个不给就用默认值了)
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

    this.instancePropConfig.__elementView = this

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
      // 判断组件交互事件类型添加鼠标悬浮状态
      // this.checkFcViewEvents(this.fcInstanceConfig.in, el)

      // 更新所有动态属性
      // Object.assign(this.instancePropConfig, this.evaluateReactiveProps())
      // this.convertPropTypes(this.instancePropConfig, this.componentDefinition.props)
      this.renderer = this.componentDefinition.factory.mount(el, this.instancePropConfig)

      // this.context.emit('mouted', this)
    } catch (e) {
      // 一些因干扰异常产生的组件渲染问题处理：重试一次
      console.error(e)
    }
    // 对于设置了显隐的情况，就进行一次显示处理
    // if (this.fcInstanceConfig.reactiveBuildInProps && this.fcInstanceConfig.reactiveBuildInProps.visible) {
    //   const isVisible = template(this.fcInstanceConfig.reactiveBuildInProps.visible, this.getVariableContext())

    //   if (isVisible === 'false' || isVisible === false) {
    //     // 更新显示
    //     this.setVisible(false)
    //   } else {
    //     this.setVisible(true)
    //   }
    // } else {
    //   this.setVisible(this.visible)
    // }
  }

  getCreateChildElement (name) {

  }

  setStatus (status) {

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
