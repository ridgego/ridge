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
      fontFamily, fontSize, color, fontWeight, fontItalic, borderWidth,
      borderStyle, borderColor, padding, borderRadius, verticalAlign, backgroundColor, backgroundImage
    } = this.props
    this.textDiv.innerHTML = text
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
    this.textDiv.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`
    this.textDiv.style.padding = padding
    this.textDiv.style.borderRadius = borderRadius || 0
    this.textDiv.style.backgroundColor = backgroundColor
    this.textDiv.style.backgroundSize = '100%'
    this.textDiv.style.backgroundRepeat = 'no-repeat'
    this.textDiv.style.backgroundImage = `url(${backgroundImage})`
  }

  update (props) {
    this.props = props
    this.render()
  }
}
