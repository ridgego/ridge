/**
 * The Interface extends by each Ridge Element
 * Includes:
 * ElementView <-- ComponentView <-- EditorComponentView
 *             <-- CompositeView <-- EditorCompositeView
 *
 *
 **/
class ElementView {
  initialize () {}

  async loadAndMount (el) {}

  async preload () {}

  mount (el) {}

  updateStyle (styles) {}

  updateProps (props) {}

  unmount () {}

  appendChild () {}

  removeChild () {}

  /**
   * 设置渲染区域提示信息
   **/
  setStatus (status, msg) {
    this.status = status

    if (!this.el) return
    // remove old status
    const overlays = this.el.querySelectorAll('.ridge-overlay')
    for (const overlay of overlays) {
      overlay.parentElement.removeChild(overlay)
    }

    const layer = document.createElement('div')
    layer.setAttribute('name', status)
    layer.classList.add('ridge-overlay')
    layer.classList.add('status-' + status)
    if (msg) {
      layer.textContent = msg
    }
    this.el.appendChild(layer)
  }

  getStatus () {
    return this.status
  }

  removeStatus (name) {
    this.status = null
    if (!this.el) return
    const overlays = this.el.querySelectorAll('.ridge-overlay')

    for (const overlay of overlays) {
      if (name) {
        if (overlay.classList.contains('status-' + name)) {
          overlay.parentElement.removeChild(overlay)
        }
      } else {
        overlay.parentElement.removeChild(overlay)
      }
    }
  }
}

export default ElementView
