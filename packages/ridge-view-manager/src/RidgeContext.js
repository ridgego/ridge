import { ElementLoader } from 'ridge-render'

const baseUrl = '/npm_packages'

class RidgeContext {
  constructor ({
    debugUrl
  }) {
    this.loader = new ElementLoader({
      baseUrl,
      debugUrl,
      unpkgUrl: baseUrl
    })
    this.pageElementManagers = {}
    this.currentPage = ''
  }

  setCurrentPageManager (name, pageElementManager) {
    this.pageElementManagers[name] = pageElementManager
    this.currentPage = name
    this.currentPageElementManager = pageElementManager
  }

  getCurrentPageElementManager () {
    return this.currentPageElementManager
  }

  emit (event, payload) {

  }
}

export default RidgeContext
