export default class CompositeWrapper {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    const { ridge, app, page } = this.props
    // 页面改变了重新挂载
    if (this.el.composite) {
      this.el.composite.unmount()
    }
    ridge.createComposite(app, page, {}).then(composite => {
      if (composite) {
        // for (const key in events ?? {}) {
        //   composite.on(key, (...payload) => {
        //     events[key].apply(null, payload)
        //   })
        // }
        composite.mount(this.el)
        this.el.composite = composite
      }
    })
  }

  update (props) {
    Object.assign(this.props, props)
    if (this.props.value != null) {
      this.input.checked = this.props.value
    }
    Object.assign(this.input.style, this.getStyle())
  }
}
