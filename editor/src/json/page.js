import { VERSION } from 'ridge-runtime'

export default {
  version: VERSION,
  style: Object.assign({
    width: 1920,
    height: 1080,
    backgournd: '',
    classNames: []
  }),
  properties: [],
  cssFiles: [],
  jsFiles: [],
  storeFiles: [],
  elements: []
}
const JS_TEMPLATE = `
export default {
  state: () => {
    return {
      name: ''
    }
  },
  getters: {
    hello: (state) => {
      return 'Hello ' + state.name
    }
  },
  actions: {
  }
}`
