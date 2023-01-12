export default class CheckBox {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.input = document.createElement('input')
    if (this.props.value != null) {
      this.input.value = this.props.value
    }
    this.el.append(this.input)
    this.input.oninput = (e) => {
      this.props.input && this.props.input(e.currentTarget.value)
    }
    this.input.onkeydown = e => {
      if (e.code === 'Enter') {
        this.props.onPressEnter && this.props.onPressEnter(e.currentTarget.value)
      }
    }
    if (this.props.placeholder) {
      this.input.placeholder = this.props.placeholder
    }
    Object.assign(this.input.style, this.getStyle())
  }

  getStyle () {
    const style = {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      ...this.props ?? {}
    }
    if (this.props.fontSize) {
      style.fontSize = this.props.fontSize + 'px'
    }

    return style
  }

  update (props) {
    Object.assign(this.props, props)
    if (this.props.value != null) {
      this.input.value = this.props.value
    } else {
      this.input.value = ''
    }
    Object.assign(this.input.style, this.getStyle())
  }
}
