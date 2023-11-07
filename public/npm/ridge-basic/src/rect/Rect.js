export default class Rect {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.div = document.createElement('div')
    this.div.style.width = '100%'
    this.div.style.height = '100%'
    this.el.append(this.div)
    this.render()
    this.div.onclick = e => {
      this.props.onClick && this.props.onClick()
    }
  }

  update (props) {
    this.props = props
    this.render()
  }

  render () {
    const {
      borderRadius,
      borderColor,
      borderStyle,
      borderWidth,
      backgroundImage,
      background
    } = this.props
    this.div.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`
    this.div.style.boxSizing = 'border-box'
    this.div.style.borderRadius = (borderRadius || 0) + 'px'

    this.div.style.background = background
    if (backgroundImage) {
      this.div.style.backgroundImage = `url(${backgroundImage})`
      this.div.style.backgroundSize = '100%'
      this.div.style.backgroundRepeat = 'no-repeat'
    } else {
      this.div.style.backgroundImage = ''
    }
  }
}
