export default class Button {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.button = document.createElement('button')
    this.button.setAttribute('type', 'button')

    this.button.style.width = '100%'
    this.button.style.height = '100%'
    this.el.append(this.button)
    this.button.onclick = (e) => {
      this.props.onClick && this.props.onClick()
    }

    this.render()
  }

  render () {
    const { text, classNames } = this.props

    this.button.innerHTML = text

    this.button.className = (classNames || []).join(' ')
  }

  update (props) {
    this.props = props
    this.render()
  }
}
