export default class DivRect {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.div = document.createElement('div')
    this.el.append(this.div)
    this.render()
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
    Object.assign(this.div.style, this.getStyle())
  }

  render () {
    Object.assign(this.div.style, this.getStyle())
  }
}
