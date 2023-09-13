export default class Image {
  constructor (props) {
    this.props = props
  }

  mount (el) {
    this.el = el

    this.render()
  }

  render () {
    const {
      objectFit, src, borderRadius, borderWidth,
      borderStyle, borderColor, className, fillColor
    } = this.props
    this.el.innerHTML = ''

    if (fillColor) {
      const fillDiv = document.createElement('div')
      this.el.append(fillDiv)
      fillDiv.style.width = '100%'
      fillDiv.style.height = '100%'
      fillDiv.className = 'ridge-image ' + className.join(' ')

      fillDiv.style.maskImage = `url(${src})`
      fillDiv.style.webkitMaskImage = `url(${src})`
      fillDiv.style.backgroundColor = fillColor

      fillDiv.style.webkitMaskRepeat = 'no-repeat'
      fillDiv.style.maskRepeat = 'no-repeat'
      fillDiv.style.webkitMaskSize = objectFit
      fillDiv.style.maskSize = objectFit
      fillDiv.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`
    } else {
      this.img = document.createElement('img')
      this.el.append(this.img)

      this.img.src = src
      this.img.style.objectFit = objectFit
      this.img.className = 'ridge-image ' + className.join(' ')
      this.img.style.width = '100%'
      this.img.style.height = '100%'
      this.img.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`
      this.img.style.borderRadius = borderRadius
    }
  }

  update (props) {
    this.props = props
    this.render()
  }
}
