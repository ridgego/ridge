import { border } from 'ridge-prop-utils'

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
    Object.assign(this.props, border.style(props))
    this.render()
  }

  render () {
    Object.assign(this.div.style, this.getStyle())
  }
}
