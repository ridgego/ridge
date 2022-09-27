import FrontComponentView from './fc_view.js'
import { FCLoader } from 'ridge-render'
import debug from 'debug'

import AnimationDecorator from './decorator/animation_decorator.js'
import DataStatusDecorator from './decorator/data_status_decorator.js'
import TooltipDecorator from './decorator/tooltip_decorator.js'
import ThemeDecorator from './decorator/theme_decorator.js'

import ScrollBarDecorator from './decorator/scrollbar_decorator.js'

const UNDEFINED_PAGE_ID = 'global'
const log = debug('runtime:fc-view-manager')

/**
 * 前端组件视图管理器，用于创建和获取前端组件操作类 FcView。全局范围仅有一个实例：fcViewManager
 *
 * 通过 fcViewManager.getComponentView(fcViewId, pageId) 可以获得一个前端组件实例
 * @class
 * @property {FCLoader} loader - 组件加载器实例
 * @property {Object} apolloApp - 应用服务实例
 * @property {Object} rootComponentViews  根上的组件， 以分页为单位
 * @property {Object} componentViews  展平后所有的组件， 以分页为单位
 * @example
 * import { InterpreteManager } from '@gw/fp-interpreter-manager';
    // 初始化解析器
    const im = new InterpreteManager()

    // 解析页面JSON数据
    const interpreter = im.interprete(pageJSONObject)

    const fcViewManager = new FCViewManager({
        // 初始化参数： 相关资源加载地址
        baseUrl: FC_BASE_URL,
        // 应用名称，通常参数从请求URL获取
        app: appID,
        // 前端运行时实例，提供各种框架运行时服务
        apolloApp: {
            sendRequest,
            openLink: handlers?.openLink,
            setAppState: handlers?.setAppState,
            appSetting,
            openScreenSaverPage: handlers?.openScreenSaverPage,
            dispatchCustomEvent: handlers?.dispatchCustomEvent
        }
    });

    // 获取解析结果后创建 Component Views
    // 注意这里是一个异步下载组件、加载、渲染的过程，但主线程可以不用等待
    await fcViewManager.createComponentViews(interpreter.getAllElements(), {
        // Tab页面ID， 每次打开一个新Tab传入不同
        pageId: 'default'
    });

    // 更新一个特定fc的属性
    fcViewManager.getComponentView('7zM7MO').updateProps({
        statistics: {
            label: '总发电量',
            unit: 'KW',
            value: total
        }
    });

    fcViewManager.getRootComponentViews('${pageid=default}').forEach(fcView => {
        fcView.unmount();
    });

    // 对于一般事件的捕获、处理
    fcViewManager.getComponentView('7zM7MO').on('input', val => {

    })

    // 对于特殊事件： input的监听 这个写法和上面的作用相同`
    fcViewManager.getComponentView('7zM7MO').input(val => {

    });

    // 获取所有的fcview
    fcViewManager.getComponentViews()

    // 对所有input类型属性的组件增加input监听,INPUT组件示例见下
    fcViewManager.getComponentViews().filter(fcView => fcView.inputPropKey).forEach(fcView => {
        fcView.input(val => {
            fcView.val(val);
        });
    });

    // mount 整体DIV 到 DOM
    interpreter.mount(el);
}
 */
class FCViewManager {
  /**
     * @param {Object} config - 基础配置
     * @param {string} config.baseUrl - 组态化组件资源服务地址
     * @param {string} config.app - 应用名称，通常参数从请求URL获取
     * @param {object} config.apolloApp - 前端运行时实例，提供各种框架运行时服务
     */
  constructor ({ baseUrl }) {
    /** @property 组件加载器 */
    this.loader = new FCLoader(baseUrl)

    /** @property 展平后所有的组件， 以分页为单位 */
    this.componentViews = {}
    /** @property 根上的组件， 以分页为单位 */
    this.rootComponentViews = {}
    /** @property {Object} rootEls 各个页面的el */
    this.rootEls = {}
    /** @property 所有变量处理器 */
    this.variableHandlers = {}
    /** @property 活动的页面 */
    this.activePages = {}
    /** @property 交互处理器 */
    this.interactHandlers = {}
    this.interpreters = {}
    this.appVariableObject = {}
    // 调试管理器，负责本地调试相关处理
    /** 页面全局整体修饰器 */
    this.pageDecorators = {
      'scroll-bar': new ScrollBarDecorator(this)
    }
    // 支持从全局修改decorators
    if (window.top.fdreConfig && window.top.fdreConfig.pageDecorators) {
      Object.assign(this.pageDecorators, window.top.fdreConfig.pageDecorators)
    }

    // 组件渲染器
    this.viewDecorators = {
      animation: new AnimationDecorator(this),
      dataStatus: new DataStatusDecorator(this),
      tooltip: new TooltipDecorator(this),
      theme: new ThemeDecorator(this)
    }
    // 支持从全局修改decorators
    if (window.top.fdreConfig && window.top.fdreConfig.fcViewDecorators) {
      Object.assign(this.viewDecorators, window.top.fdreConfig.fcViewDecorators)
    }
  }

  async init () {
    for (const decorator of Object.values(this.pageDecorators)) {
      await decorator.init(this)
    }
  }

  /**
     * 设置交互处理器
     * @param {*} interactHandler
     */
  setInteractHandler (fpId, interactHandler) {
    this.interactHandlers[fpId] = interactHandler
  }

  setDebugInfo (debugUrl, packageName) {
    this.debugUrl = debugUrl
    this.debugPackageName = packageName
    this.loader.setDebugUrl(debugUrl)
    this.loader.setDebugPackageName(packageName)
  }

  /**
     * 更新上下文信息，主要从 context.appSetting.params 中判断以下参数
     *
     * - ant-style  替换antd样式数据
     *
     * - token 替换设置访问token值
     * @param {Object} context 上下文信息对象
     */
  updateAppContext (context) {
    this.apolloApp = Object.assign(this.apolloApp, context)

    // this.i18nManager.contextUpdate(context);

    if (this.apolloApp.appSetting) {
      this.appVariableObject.appSetting = this.apolloApp.appSetting
      const externalOptions = {}

      if (this.apolloApp.appSetting.params) {
        for (const param of this.apolloApp.appSetting.params) {
          if (param.name && param.name.endsWith('-style')) {
            externalOptions[param.name.substr(0, param.name.length - '-style'.length)] = param.value
          }
          // 优先从store中获取
          if (context.runtimeApp) {
            // 只有token才从store 进而在localStorage中读取
            if (param.name === 'token') {
              this.appVariableObject[param.name] = context.runtimeApp.options.handlers.getAppVariable(param.name)
            } else {
              this.appVariableObject[param.name] = param.value
            }
          } else {
            this.appVariableObject[param.name] = param.value
          }
        }
      }
      this.loader.setExternalOptions(externalOptions)
    }

    for (const decorator of Object.values(this.pageDecorators)) {
      decorator.contextUpdate(context, this)
    }
  }

  /**
     * 为页面注册页面变量处理器
     * @param {VaraiableHandler} variableHandler 变量处理器
     */
  registerVariableHandler (variableHandler) {
    this.variableHandlers[variableHandler.pageName] = variableHandler
  }

  /**
     * 更新应用变量服务
     * @param {Object} variables - 变量数据信息
     */
  updateAppVariables (variables) {
    Object.assign(this.appVariableObject, variables)

    for (const key of Object.keys(variables)) {
      // 对所有活动页面进行通知
      for (const page of Object.keys(this.activePages)) {
        if (this.activePages[page] === true && this.variableHandlers[page]) {
          // 通知变量变化
          this.variableHandlers[page].appVariableChange('app.' + key, variables[key])
        }
      }
    }
  }

  /**
     * 为一个页面创建多个组件服务实例, 通常供页面解析出多个组件后初始化整体页面视图使用
     * @param {Array} components 组件列表
     * @param {*} opts
     */
  async createComponentViews (components, opts) {
    await this.loader.loadPackageCache()

    if (opts.preloadAll) {
      await this.loader.loadPels(opts.interpreter.flaternedElements)
    }

    const options = Object.assign({
      pageId: UNDEFINED_PAGE_ID,
      preloadChild: false
    }, opts)

    if (!this.componentViews[options.pageId]) {
      this.componentViews[options.pageId] = {}
    }

    if (!this.rootComponentViews[options.pageId]) {
      this.rootComponentViews[options.pageId] = {}
    }
    this.rootEls[options.pageId] = opts.rootEl
    this.interpreters[options.pageId] = opts.interpreter

    const rootFrontViews = []
    const loading = []

    for (const component of components) {
      log('创建 fcView:', component.guid, component)
      try {
        if (opts.rootEl) {
          opts.rootEl.appendChild(component.el)
        }
        const frontComponentView = new FrontComponentView({
          fcInstanceConfig: component,
          loader: this.loader,
          apolloApp: this.apolloApp,
          contextVariables: Object.assign(opts.variables, {
            app: this.appVariableObject
          }),
          decorators: this.viewDecorators,
          // 渐进式加载： false时表示带着子节点加载
          preloadChild: (opts.progressiveLoad === false),
          pageId: options.pageId
        })

        this.componentViews[options.pageId][frontComponentView.fcId] = frontComponentView

        // 进行根节点组件加载和渲染
        loading.push(frontComponentView.loadAndRender())

        this.rootComponentViews[options.pageId][frontComponentView.fcId] = frontComponentView
      } catch (e) {
        console.error(e)
      }
    }
    // 组件的加载进行并行处理
    await Promise.all(loading)

    for (const frontComponentView of Object.values(this.rootComponentViews[options.pageId])) {
      try {
        // 获取子节点也给到全局，便于节点的查找
        const childrenViews = frontComponentView.getLayoutChildrenViews()

        if (childrenViews.length) {
          for (const childView of childrenViews) {
            if (childView.fcId) {
              this.componentViews[options.pageId][childView.fcId] = childView
            }
          }
        }
        rootFrontViews.push(frontComponentView)
      } catch (e) {
        console.error(e)
      }
    }

    this.rootFrontViews = rootFrontViews
    // const tree = this.printFrontViewTree(rootFrontViews);

    this.attachResizeObserver(opts.rootEl, this.rootComponentViews[options.pageId])

    if (this.interactHandlers[options.pageId]) {
      this.interactHandlers[options.pageId].attachInteractToPage(opts.rootEl, opts.interpreter)
    }

    // 处理组件之间可能有的相互引用的情况，必须得要所有组件都初始化完成后才能拿到对方链接
    for (const fcView of Object.values(this.componentViews[options.pageId])) {
      fcView.initLink(this.componentViews[options.pageId])
    }

    this.activePages[opts.pageId] = true

    for (const decorator of Object.values(this.pageDecorators)) {
      await decorator.onPageViewsCreated(this)
    }
    // this.layoutPageViews(options.pageId);
  }

  async refreshDebugViews () {
    await this.loader.reloadDebugCache()

    for (const pageId of Object.keys(this.componentViews)) {
      const pageComponentViews = this.componentViews[pageId]

      for (const fcView of Object.values(pageComponentViews)) {
        if (fcView.fcInstanceConfig.packageName === this.debugPackageName) {
          fcView.componentDefinition = await this.loader.loadPel(fcView.fcInstanceConfig)

          fcView.mount(fcView.el)
        }
      }
    }
  }

  attachResizeObserver (el, fcViews) {
    // 这个方式监听可能会有其他影响 暂时去除。 resize布局由外面去触发
    // const resizeObserver = new ResizeObserver(entries => {
    //     if (Object.values(fcViews)) {
    //         for (const fcView of Object.values(fcViews)) {
    //             fcView.layout();
    //         }
    //     }
    // });

    // resizeObserver.observe(el);
  }

  renderPageOn (pageId, el) {
    const viewSet = this.rootComponentViews[pageId]

    // 配置为只detach的情况： 则只挂载回DOM
    if (this.variableHandlers[pageId].variableValues.detachOnly === true) {
      if (Object.values(viewSet)) {
        for (const fcView of Object.values(viewSet)) {
          el.appendChild(fcView.el)
        }
      }
    } else {
      // 挂载DOM，并且重新初始化组件数据
      if (Object.values(viewSet)) {
        for (const fcView of Object.values(viewSet)) {
          el.appendChild(fcView.el)
          fcView.mount()
        }
      }
    }

    this.attachResizeObserver(el, viewSet)
    this.activePages[pageId] = true

    // this.interactHandler && this.interactHandler.onPageTabIn(this.interpreters[pageId]);
  }

  /**
     * 在ws连接重新建立后提供的回调
     */
  csfPageOpened (pageId) {
    this.interactHandlers[pageId] && this.interactHandlers[pageId].onPageTabIn(this.interpreters[pageId], pageId)
  }

  mount (div, elements) {
    for (const element of elements) {
      div.appendChild(element.el)
    }
  }

  printFrontViewTree (rootFrontViews) {
    const result = {}

    for (const view of rootFrontViews) {
      if (view.fcInstanceConfig.guid) {
        result[view.fcInstanceConfig.guid] = {
        }
        if (view.childrenFcViews && view.childrenFcViews.length) {
          result[view.fcInstanceConfig.guid].children = this.printFrontViewTree(view.childrenFcViews)
        }
      }
    }

    return result
  }

  async layoutPageViews (pageId) {
    const pageViews = this.componentViews[pageId]

    for (const fcView of Object.values(pageViews)) {
      fcView.layout()
    }
  }

  async createComponentView ({
    packageName,
    path
  }, el, viewConfig) {
    try {
      const frontComponentView = new FrontComponentView({
        el,
        packageName,
        path,
        viewConfig,
        loader: this.loader
      })
      await frontComponentView.loadAndRender()
      return frontComponentView
    } catch (e) {
      console.error('Error Create View', e)
      return null
    }
  }

  getComponentViews (pageId = UNDEFINED_PAGE_ID) {
    return Object.values(this.componentViews[pageId])
  }

  /**
     * 获取页面的所有根组件实例
     * @param pageId
     * @returns {Array} 根节点列表数组
     */
  getRootComponentViews (pageId = UNDEFINED_PAGE_ID) {
    if (this.rootComponentViews[pageId]) {
      return Object.values(this.rootComponentViews[pageId])
    } else {
      return []
    }
  }

  /**
     * 根据组件id获得组件FcView实例
     * @param componentId 组件id
     * @param pageId  组件所属页面ID，可以不填则从整个页面范围查找（重复只返回第一个）
     */
  getComponentView (componentId, pageId = UNDEFINED_PAGE_ID) {
    let fcView = null

    if (this.componentViews[pageId]) {
      fcView = this.componentViews[pageId][componentId]
    }

    if (fcView == null) {
      for (const pageViews of Object.values(this.componentViews)) {
        if (pageViews[componentId]) {
          return pageViews[componentId]
        }
      }
    }
    return fcView
  }

  setGlobalScrollBar ({
    enabled,
    width = 8,
    radius = 4,
    color = '#67C1EC'
  }) {

  }

  /**
     * 页面去除挂载
     * @param {*} pageId
     */
  detachPage (pageId) {
    this.interactHandlers[pageId] && this.interactHandlers[pageId].onPageDetach(this.interpreters[pageId])
    this.activePages[pageId] = false
    // 配置为只detach的情况：不做任何处理， 否则unmout以释放内存
    if (this.variableHandlers[pageId].variableValues.detachOnly !== true) {
      if (pageId && this.componentViews[pageId]) {
        for (const fcView of Object.values(this.componentViews[pageId])) {
          fcView.unmount()
        }
      }
    }
  }

  /**
     * 销毁指定页面或者所有页面的组件渲染
     * @param pageId
     */
  destroy (pageId) {
    if (pageId) {
      if (this.componentViews[pageId]) {
        for (const fcView of Object.values(this.componentViews[pageId])) {
          fcView.renderer.destroy()
        }
      }
    } else {
      for (const page of Object.values(this.componentViews)) {
        for (const fcView of Object.values(page)) {
          fcView.renderer.destroy()
        }
      }
    }
  }
}

export default FCViewManager
