import Selecto from 'selecto'
import Moveable from 'moveable'

export const createMoveable = () => {
  return new Moveable(document.body, {
    className: 'workspace-movable',
    target: this.viewPortEl,
    dimensionViewable: true,
    deleteButtonViewable: false,
    // If the container is null, the position is fixed. (default: parentElement(document.body))
    container: document.body,
    snappable: false,
    snapGap: false,
    isDisplayInnerSnapDigit: false,
    draggable: true,
    resizable: true,
    scalable: false,
    rotatable: false,
    warpable: false,
    // Enabling pinchable lets you use events that
    // can be used in draggable, resizable, scalable, and rotateable.
    pinchable: false, // ["resizable", "scalable", "rotatable"]
    origin: true,
    keepRatio: false,
    // Resize, Scale Events at edges.
    edge: false,
    throttleDrag: 0,
    throttleResize: 1,
    throttleScale: 0,
    throttleRotate: 0,
    clipTargetBounds: true
  })
}
