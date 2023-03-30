import ComponentLoader from './loader/ComponentLoader'
import PageElementManager from './element/PageElementManager'
import Store from './store/Store.js'
/**
 * The Ridge Platform Runtime
 */
class Ridge {
  constructor (opts = {}) {
    this.VERSION = '1.0.0'
    const baseUrl = opts.baseUrl ?? '/npm_packages'
    const unpkgUrl = opts.unkpgUrl ?? baseUrl
    const debugUrl = opts.debugUrl

    const states = opts.states || []
    const reducers = opts.reducers || []

    this.loader = new ComponentLoader({
      baseUrl,
      debugUrl,
      unpkgUrl
    })
    this.store = new Store({ states, reducers })
    this.pageElementManagers = {}
  }

  static async load (json) {
    const instance = new Ridge()
    window.ridge = instance

    const jsonObject = await instance.loader.loadJSON(json)
    instance.loadPage(null, jsonObject)
  }

  /**
   * 通用库功能： 加载组件
   * @param {String} componentPath 组件路径
   * @returns 组件定义信息
   */
  loadComponent (componentPath) {
    return this.loader.loadComponent(componentPath)
  }

  /**
   * 加载、显示页面到某个页面el
   * @param {*} el 页面元素
   * @param {*} pageConfig 页面配置
   * @param {*} mode 模式 edit/run
   * @returns
   */
  loadPage (el, pageConfig, mode) {
    const pageManager = new PageElementManager(JSON.parse(JSON.stringify(pageConfig)), this, mode)
    pageManager.mount(el || document.body)
    return pageManager
  }

  /**
   * 从页面配置创建页面管理器。主要用于预加载场景，管理器可以先不mount
   * @param {*} pageConfig 页面配置
   * @param {*} mode 模式 edit/run
   * @returns
   */
  createPageManager (pageConfig, mode) {
    const pageManager = new PageElementManager(JSON.parse(JSON.stringify(pageConfig)), this, mode)

    return pageManager
  }

  getPageElementManager (id) {
    return this.pageElementManagers[id]
  }

  registerMethod (name, method) {
    this[name] = method
  }
}

export default Ridge
