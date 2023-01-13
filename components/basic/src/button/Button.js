export default class CheckBox {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    // <input class="task-status" type="checkbox" checked="true" data-id="-1">
    this.button = document.createElement('button')

    this.el.append(this.button)
    this.button.onclick = (e) => {
      this.props.onClick && this.props.onClick()
    }
    this.update()
  }

  getStyle () {
    const style = {
      width: '100%',
      height: '100%',
      cursor: 'pointer',
      boxSizing: 'border-box',
      appearance: 'button',
      borderRadius: this.props.borderRadius + 'px',
      border: this.props.border,
      color: this.props.color,
      backgroundColor: this.props.backgroundColor
    }
    if (this.props.fontSize) {
      style.fontSize = this.props.fontSize + 'px'
    }

    return style
  }

  update (props) {
    if (props) {
      Object.assign(this.props, props)
    }
    if (this.props.text) {
      this.button.innerHTML = this.props.text
    } else {
      this.button.innerHTML = ''
    }
    Object.assign(this.button.style, this.getStyle())
  }
}
