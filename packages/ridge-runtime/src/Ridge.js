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

  mount (html, el) {

  }

  registerMethod (name, method) {
    this[name] = method
  }
}

export default Ridge
