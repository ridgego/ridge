export default class TextArea {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.textarea = document.createElement('textarea')
    this.textarea.style.width = '100%'
    this.textarea.style.height = '100%'
    this.el.append(this.textarea)
    this.textarea.oninput = (e) => {
      this.textarea.input && this.textarea.input(e.currentTarget.value)
    }
    this.textarea.onkeydown = e => {
      if (e.code === 'Enter') {
        this.textarea.onPressEnter && this.textarea.onPressEnter(e.currentTarget.value)
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
      value, placeholder, fontFamily, fontSize, color, padding, readonly,
      backgroundColor, borderWidth, borderStyle, borderColor, borderRadius, classNames
    } = this.props

    if (placeholder != null) {
      this.textarea.placeholder = placeholder
    } else {
      this.textarea.placeholder = ''
    }
    if (value != null) {
      this.textarea.value = value
    } else {
      this.textarea.value = ''
    }
    this.textarea.style.fontFamily = fontFamily
    this.textarea.style.fontSize = fontSize + 'px'
    this.textarea.style.color = color
    this.textarea.style.border = `${borderWidth || 0}px ${borderStyle || 'solid'} ${borderColor || '#ccc'}`
    this.textarea.style.borderRadius = borderRadius + 'px'
    this.textarea.style.padding = padding + 'px'
    this.textarea.style.backgroundColor = backgroundColor

    this.textarea.readOnly = readonly
    this.textarea.className = (classNames || []).join(' ')
  }
}
