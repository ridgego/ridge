import './style.css'
export default class Button {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.button = document.createElement('div')
    this.button.className = 'calculator-equal-button'

    this.el.append(this.button)
    this.button.onclick = (e) => {
      this.props.onClick && this.props.onClick()
    }

    this.render()
  }

  render () {
    const { text } = this.props
    this.button.innerHTML = text || ''
  }

  update (props) {
    this.props = props
    this.render()
  }
}
