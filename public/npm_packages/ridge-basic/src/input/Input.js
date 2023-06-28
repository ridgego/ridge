export default class Input {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.input = document.createElement('input')
    this.input.style.width = '100%'
    this.input.style.height = '100%'
    this.el.append(this.input)
    this.input.oninput = (e) => {
      this.props.input && this.props.input(e.currentTarget.value)
    }
    this.input.onkeydown = e => {
      if (e.code === 'Enter') {
        this.props.onPressEnter && this.props.onPressEnter(e.currentTarget.value)
      }
    }
    this.render()
  }

  update (props) {
    this.props = props
    this.render()
  }

  render () {
    const {
      value, placeholder, fontFamily, fontSize, color, textAlign,
      backgroundColor, borderWidth, borderStyle, borderColor, borderRadius, classNames
    } = this.props

    if (placeholder != null) {
      this.input.placeholder = placeholder
    } else {
      this.input.placeholder = ''
    }
    if (value != null) {
      this.input.value = value
    } else {
      this.input.value = ''
    }
    this.input.style.textAlign = textAlign
    this.input.style.fontFamily = fontFamily
    this.input.style.fontSize = fontSize + 'px'
    this.input.style.color = color
    this.input.style.border = `${borderWidth || 0}px ${borderStyle || 'solid'} ${borderColor || '#ccc'}`
    this.input.style.borderRadius = borderRadius + 'px'
    this.input.style.backgroundColor = backgroundColor
    this.input.className = (classNames || []).join(' ')
  }
}
