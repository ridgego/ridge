import { text } from 'ridge-prop-utils'

export default class Text {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.textDiv = document.createElement('div')

    this.textDiv.innerHTML = this.props.text
    this.el.append(this.textDiv)
    Object.assign(this.textDiv.style, this.getStyle())
  }

  getStyle () {
    const style = {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      textAlign: this.props.textAlign,
      ...text.style(this.props)
    }
    return style
  }

  update (props) {
    Object.assign(this.props, props)
    this.textDiv.innerHTML = this.props.text
    Object.assign(this.textDiv.style, this.getStyle())
  }
}
