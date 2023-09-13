export default class Button {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.button = document.createElement('button')
    this.button.setAttribute('type', 'button')

    this.button.style.width = '100%'
    this.button.style.height = '100%'
    this.el.append(this.button)
    this.button.onclick = (e) => {
      this.props.onClick && this.props.onClick()
    }

    this.render()
  }

  render () {
    const {
      text, fontFamily, fontSize,
      color, borderWidth, borderStyle, borderColor, borderRadius, backgroundColor, classNames
    } = this.props

    this.button.innerHTML = text
    this.button.style.fontFamily = fontFamily
    this.button.style.fontSize = fontSize + 'px'
    this.button.style.color = color
    this.button.style.border = `${borderWidth || 0}px ${borderStyle || 'solid'} ${borderColor || '#ccc'}`
    this.button.style.borderRadius = borderRadius
    this.button.style.backgroundColor = backgroundColor

    this.button.className = (classNames || []).join(' ')
  }

  update (props) {
    this.props = props
    this.render()
  }
}
