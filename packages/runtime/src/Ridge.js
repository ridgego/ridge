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

  loadPage (el, pageConfig, reactive) {
    const pageManager = new PageElementManager(JSON.parse(JSON.stringify(pageConfig)), this, reactive)
    pageManager.mount(el || document.body)
    return pageManager
  }

  createPageManager (pageConfig, reactive) {
    const pageManager = new PageElementManager(JSON.parse(JSON.stringify(pageConfig)), this, reactive)

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
