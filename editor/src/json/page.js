import { VERSION } from 'ridge-runtime'

export default {
  version: VERSION,
  style: Object.assign({
    width: 1920,
    height: 1080,
    background: '',
    classNames: []
  }),
  properties: [],
  cssFiles: [],
  jsFiles: [],
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
