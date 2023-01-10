export default class DivRect {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    Object.assign(el.style, this.getStyle())
  }

  getStyle () {
    return {
      width: '100%',
      height: '100%',
      ...this.props ?? {}
    }
  }

  update (props) {
    Object.assign(this.props, props)
    Object.assign(this.el.style, this.getStyle())
  }
}
