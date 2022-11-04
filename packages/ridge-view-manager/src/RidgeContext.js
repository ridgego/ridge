import { ElementLoader } from 'ridge-render'

const baseUrl = '/npm_packages'

class RidgeContext {
  constructor (context) {
    this.loader = new ElementLoader({
      baseUrl,
      debugUrl: 'https://localhost:8700',
      unpkgUrl: baseUrl
    })
  }

  emit (event, payload) {

  }
}

export default RidgeContext
