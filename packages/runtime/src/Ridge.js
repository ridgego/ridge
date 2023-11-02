import './style.css'
import './normalize.css'

import ComponentLoader from './loader/ComponentLoader.js'
import CompositeView from './view/CompositeView.js'
import ky from 'ky'

const VERSION = '1.1.0'

/**
 * The Ridge Platform Runtime
 */
class RidgeContext {
  constructor ({ baseUrl }) {
    this.VERSION = VERSION
    this.ky = ky
    this.baseUrl = baseUrl
 
    // this.loadScript = this.loader.loadScript
    this.services = {
      loader: new ComponentLoader({
        baseUrl: this.baseUrl
      })
    }

    this.delegateMethods(this.services.loader, ['loadScript', 'loadJSON', 'loadCss', 'getPackageJSON', 'loadComponent'])
  }

  /**
   * Delegate target[method] -> source[method]
   **/
  delegateMethods (target, methods, source = this) {
    for (const method of methods) {
      if (target[method]) {
        source[method] = target[method].bind(target)
      } else {
        console.error('delegateMethods error:', target + '.' + method)
      }
    }
  }

  static async init () {

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
    const pageManager = new CompositeView({ pageConfig: JSON.parse(JSON.stringify(pageConfig)), ridge: this, mode, app })
    pageManager.loadAndMount(el || document.body)
    return pageManager
  }
}

export default RidgeContext

export {
  VERSION
}
