export default class Image {
  constructor (props) {
    this.props = props
  }

  mount (el) {
    this.el = el
    this.img = document.createElement('img')

    this.el.append(this.img)
    this.render()
  }

  render () {
    const { objectFit, src, borderRadius, border, className } = this.props
    this.img.className = 'ridge-image ' + className.join(' ')
    this.img.src = src

    this.img.style.width = '100%'
    this.img.style.height = '100%'
    this.img.style.objectFit = objectFit
    this.img.style.border = border
    this.img.style.borderRadius = borderRadius
  }

  update (props) {
    this.props = props
    this.render()
  }
}
