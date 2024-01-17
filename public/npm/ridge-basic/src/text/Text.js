export default class Text {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.textDiv = document.createElement('div')
    this.textDiv.style.width = '100%'
    this.textDiv.style.height = '100%'
    this.el.append(this.textDiv)

    this.render()
  }

  render () {
    const {
      text, textAlign,
      fontFamily, fontSize, color, fontWeight, fontItalic, borderRadius, verticalAlign, backgroundColor
    } = this.props
    if (text != null) {
      this.textDiv.innerHTML = text
    } else {
      this.textDiv.innerHTML = ''
    }
    this.textDiv.style.fontFamily = fontFamily
    if (fontWeight) {
      this.textDiv.style.fontWeight = 'bold'
    } else {
      this.textDiv.style.fontWeight = 'normal'
    }

    if (fontItalic) {
      this.textDiv.style.fontStyle = 'italic'
    } else {
      this.textDiv.style.fontStyle = 'normal'
    }

    this.textDiv.style.display = 'flex'
    this.textDiv.style.alignItems = verticalAlign
    this.textDiv.style.justifyContent = textAlign

    this.textDiv.style.fontSize = fontSize + 'px'
    this.textDiv.style.color = color
    this.textDiv.style.borderRadius = borderRadius || 0
    this.textDiv.style.backgroundColor = backgroundColor
  }

  update (props) {
    this.props = props
    this.render()
  }
}
