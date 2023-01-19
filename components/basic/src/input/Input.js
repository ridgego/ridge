import { border } from 'ridge-prop-utils'
export default class Input {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.input = document.createElement('input')
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
    Object.assign(this.props, props)
    this.render()
  }

  render () {
    if (this.props.placeholder) {
      this.input.placeholder = this.props.placeholder
    }
    if (this.props.value != null) {
      this.input.value = this.props.value
    } else {
      this.input.value = ''
    }
    Object.assign(this.input.style, this.getStyle())
  }

  getStyle () {
    const style = {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box'
    }
    if (this.props.color) {
      style.color = this.props.color
    }
    if (this.props.fontSize) {
      style.fontSize = this.props.fontSize + 'px'
    }

    Object.assign(style, border.style(this.props))
    return style
  }
}
