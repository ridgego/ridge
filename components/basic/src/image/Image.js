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
      objectFit, src, className, fillColor
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
    } else {
      this.img = document.createElement('img')
      this.el.append(this.img)

      if (src) {
        if (src.then) {
          src.then(r => {
            this.img.src = r
          })
        } else {
          this.img.src = src
        }
        this.img.style.objectFit = objectFit
        this.img.className = 'ridge-image ' + className.join(' ')
        this.img.style.width = '100%'
        this.img.style.height = '100%'
      } else {
        this.img.src = 'data:image/svg+xml,%3Csvg xmlns="http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cpath fill="%23eee" d="m14 6l-3.75 5l2.85 3.8l-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22z"%2F%3E%3C%2Fsvg%3E'
        this.img.className = 'ridge-image ' + className.join(' ')
        this.img.style.width = '100%'
        this.img.style.height = '100%'
        this.img.style.background = '#dedede'
      }
    }
  }

  update (props) {
    this.props = props
    this.render()
  }
}
