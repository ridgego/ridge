export default class Button {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.button = document.createElement('button')
    this.button.setAttribute('type', 'button')

    this.el.append(this.button)
    this.button.onclick = (e) => {
      this.props.onClick && this.props.onClick()
    }

    this.render()
  }

  render () {
    if (this.props.text) {
      this.button.innerHTML = this.props.text
    } else {
      this.button.innerHTML = ''
    }
    Object.assign(this.button.style, this.getStyle())
  }

  getStyle () {
    const style = {
      width: '100%',
      height: '100%',
      cursor: 'pointer',
      boxSizing: 'border-box',
      lineHeight: '100%',
      appearance: 'button',
      color: this.props.color
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
    this.render()
  }
}
