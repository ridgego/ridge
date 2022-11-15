import ElementLoader from './loader/ElementLoader'
import PageElementManager from './element/PageElementManager'
/**
 * The Ridge Platform Runtime
 */
class Ridge {
  constructor (opts) {
    const baseUrl = opts.baseUrl ?? '/npm_packages'
    const unpkgUrl = opts.unkpgUrl ?? baseUrl
    const debugUrl = opts.debugUrl

    this.loader = new ElementLoader({
      baseUrl,
      debugUrl,
      unpkgUrl
    })
    this.pageElementManagers = {}
  }

  /**
   * 通用库功能： 加载组件
   * @param {String} componentPath 组件路径
   * @returns 组件定义信息
   */
  loadComponent (componentPath) {
    return this.loader.loadComponent(componentPath)
  }

  initialize (el, id) {
    const pageElementManager = new PageElementManager(this, el)
    pageElementManager.initialize()

    this.pageElementManagers[id ?? 'default'] = pageElementManager

    return pageElementManager
  }

  registerMethod (name, method) {
    this[name] = method
  }
}

export default Ridge
