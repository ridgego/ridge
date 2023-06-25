export default class Text {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.textDiv = document.createElement('div')
    this.el.append(this.textDiv)

    this.render()
  }

  render () {
    const { text, textAlign, font } = this.props
    this.textDiv.innerHTML = text
    this.textDiv.style.textAlign = textAlign

    Object.assign(this.textDiv.style, font)
  }

  update (props) {
    this.props = props
    this.render()
  }
}
