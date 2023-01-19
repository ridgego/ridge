export default class Icon {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.render()
  }

  async render () {
    if (this.props.src) {
      this.el.innerHTML = this.props.src
    }
    this.el.onclick = () => {
      this.props.onClick && this.props.onClick(this.props)
    }
    const svg = this.el.querySelector('svg')

    if (svg) {
      svg.style.width = '100%'
      svg.style.height = '100%'
      svg.style.fill = this.props.color
      svg.style.cursor = this.props.cursor
    }
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
    this.render()
  }
}
