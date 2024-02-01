import './style.css'
import './normalize.css'

import ComponentLoader from './loader/ComponentLoader.js'
import Composite from './node/Composite.js'
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

  unDelegateMethods (target, methods, source = this) {
    for (const method of methods) {
      delete source[method]
    }
  }

  static async init () {

  }

  async createComposite (baseUrl, pagePath, properties) {
    if (baseUrl == null || pagePath == null) {
      return
    }
    const appBaseUrl = (baseUrl.startsWith('/') || baseUrl.startsWith('http')) ? baseUrl : (this.baseUrl + '/' + baseUrl)

    try {
      const pageJSONObject = await this.loadJSON((appBaseUrl + '/' + pagePath + '.json').replace(/\/\//g, '/'))
      // ky.get((appBaseUrl + '/' + pagePath + '.json').replace(/\/\//g, '/')).json()
      const composite = new Composite({ config: pageJSONObject, context: this, appBaseUrl, properties })

      return composite
    } catch (e) {
      console.error('createComposite error', e)
      return null
    }
  }
}

export default RidgeContext

export {
  RidgeContext,
  VERSION
}
