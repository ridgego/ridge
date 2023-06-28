export default class Select {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.select = document.createElement('select')
    this.select.style.width = '100%'
    this.select.style.height = '100%'
    this.el.append(this.select)
    this.select.oninput = (e) => {
      this.props.input && this.props.input(e.currentTarget.value)
    }
    this.render()
  }

  update (props) {
    this.props = props
    this.render()
  }

  render () {
    const {
      value, options, placeholder, fontFamily, fontSize, borderRadius, classNames,
      borderWidth, borderStyle, borderColor, color
    } = this.props

    this.select.innerHTML = '<option value="">' + placeholder + '</option>' + (options || []).map(option => `<option ${option.value === value ? 'selected' : ''} value="${option.value}">${option.label}</option>`).join('')

    if (placeholder != null) {
      this.select.placeholder = placeholder
    } else {
      this.select.placeholder = ''
    }

    this.select.style.color = color
    this.select.style.fontFamily = fontFamily
    this.select.style.fontSize = fontSize + 'px'
    this.select.style.borderRadius = borderRadius + 'px'
    this.select.style.border = `${borderWidth || 0}px ${borderStyle || 'solid'} ${borderColor || '#ccc'}`
    this.select.className = (classNames || []).join(' ')
  }
}
