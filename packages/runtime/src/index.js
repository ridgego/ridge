import Ridge, { VERSION } from './Ridge'
import { externals } from './loader/dependencies.js'
import Composite from './node/Composite.js'
import Element from './node/Element.js'
import ValtioStore from './store/ValtioStore.js'
import RidgeReact from './use/RidgeReact.jsx'
window.Ridge = Ridge

export default Ridge

export {
  VERSION,
  Composite,
  Element,
  ValtioStore,
  externals,
  RidgeReact
}
