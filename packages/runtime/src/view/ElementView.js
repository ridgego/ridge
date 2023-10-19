class ElementView {
  async loadAndMount (el) {}
  unmount () {}

  initPropsAndEvents () {}

  updateStyle () {}

  updateProps (props) {}

  setStatus (status, msg) {
    this.status = status

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
    this.status = null
  }
}

export default ElementView