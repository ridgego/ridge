import './style.css'
import BackSpaceSVG from './backspace-svgrepo-com.svg'
export default class Button {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.button = document.createElement('div')
    this.button.className = 'calculator-back-button'

    this.el.append(this.button)
    this.button.onclick = (e) => {
      this.props.onClick && this.props.onClick()
    }

    this.render()
  }

  render () {
    this.button.innerHTML = '<img src=" ' + BackSpaceSVG + '"></img>'
  }

  update (props) {
    this.props = props
    this.render()
  }
}
