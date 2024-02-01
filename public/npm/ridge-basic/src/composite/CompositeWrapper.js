export default class CompositeWrapper {
  constructor (props) {
    this.props = props
  }

  getRidge () {
    return window.ridge ?? this.props.ridge
  }

  async mount (el) {
    this.el = el

    this.loadMountComposite()
  }

  async loadMountComposite () {
    const { ridge, composite, app, page } = this.props
    // 页面改变了重新挂载
    if (this.el.composite) {
      this.el.composite.unmount()
    }

    if (page) {
      const compositeCreated = await ridge.createComposite(app || composite.appBaseUrl, page, {})

      if (compositeCreated) {
        compositeCreated.mount(this.el)
        this.el.composite = compositeCreated
      }
    }
  }

  update (props) {
    Object.assign(this.props, props)
    this.loadMountComposite()
  }
}
