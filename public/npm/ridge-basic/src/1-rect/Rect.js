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
      backgroundColor,
      backgroundImage
    } = this.props
    this.div.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`
    this.div.style.borderRadius = borderRadius || 0
    this.div.style.backgroundColor = backgroundColor
    this.div.style.backgroundSize = '100%'
    this.div.style.backgroundRepeat = 'no-repeat'
    this.div.style.backgroundImage = `url(${backgroundImage})`
  }
}
