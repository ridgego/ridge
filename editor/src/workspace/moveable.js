import './moveable.css'
import Moveable from 'moveable'

export const createMoveable = (opts) => {
  return new Moveable(document.body, Object.assign({
    dimensionViewable: true,
    deleteButtonViewable: false,
    container: document.body,
    snappable: false,
    snapGap: false,
    isDisplayInnerSnapDigit: false,
    draggable: true,
    resizable: true,
    scalable: false,
    rotatable: false,
    warpable: false,
    // can be used in draggable, resizable, scalable, and rotateable.
    pinchable: true, // ["resizable", "scalable", "rotatable"]
    origin: true,
    keepRatio: false,
    // Resize, Scale Events at edges.
    edge: false,
    throttleDrag: 0,
    throttleResize: 1,
    throttleScale: 0,
    throttleRotate: 0,
    clipTargetBounds: true
  }, opts))
}
