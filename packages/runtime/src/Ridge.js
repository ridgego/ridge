import './style.css'
import './normalize.css'

import ComponentLoader from './loader/ComponentLoader'
import PageElementManager from './element/PageElementManager'
import ky from 'ky'

const VERSION = '1.0.1'

/**
 * The Ridge Platform Runtime
 */
class RidgeContext {
  constructor (opts = {}) {
    this.VERSION = VERSION
    this.ky = ky
    this.opts = opts
    this.baseUrl = opts.baseUrl || 'https://ridgego.github.io'

    this.loader = new ComponentLoader({
      baseUrl: this.baseUrl
    })

    this.loadScript = this.loader.loadScript
    this.services = {}
  }

  static async init () {

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

  async mountPage (el, appName, pagePath) {
    const jsonPath = (this.opts.baseUrl + '/' + appName + '/' + pagePath).replace(/\/\//g, '/')
    const pageJSONObject = await ky.get(jsonPath).json()
    this.loadPage(el, pageJSONObject, 'hosted', appName)
  }

  /**
   * 加载、显示页面到某个页面el
   * @param {*} el 页面元素
   * @param {*} pageConfig 页面配置
   * @param {*} mode 模式 edit/run
   * @returns
   */
  loadPage (el, pageConfig, mode, app) {
    const pageManager = new PageElementManager({ pageConfig: JSON.parse(JSON.stringify(pageConfig)), ridge: this, mode, app })
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
    const pageManager = new PageElementManager({ pageConfig: JSON.parse(JSON.stringify(pageConfig)), ridge: this, mode })

    return pageManager
  }
}

export default RidgeContext

export {
  VERSION
}
