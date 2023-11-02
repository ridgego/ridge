import Ridge, { VERSION } from './Ridge'
import CompositeView from './view/CompositeView.js'
import ComponentView from './view/ComponentView.js'
import ValtioStore from './view/ValtioStore.js'
import RidgeReact from './use/RidgeReact.jsx'
window.Ridge = Ridge

export default Ridge

export {
  VERSION,
  CompositeView,
  ComponentView,
  ValtioStore,
  RidgeReact
}
