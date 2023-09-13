export default class Radio {
  constructor (props) {
    this.props = props
    this.name = 'radio' + Math.floor(Math.random() * 100000)
  }

  async mount (el) {
    this.el = el
    this.div = document.createElement('div')
    this.div.style.width = '100%'
    this.div.style.height = '100%'
    this.div.style.display = 'flex'
    this.el.append(this.div)
    this.div.oninput = (e) => {
      this.props.input && this.props.input(e.target.value)
      this.props.onChange && this.props.onChange(e.target.value)
    }
    this.render()
  }

  update (props) {
    this.props = props
    this.render()
  }

  render () {
    const {
      value, options, fontFamily, fontSize, classNames, color, direction
    } = this.props

    if (direction === true) {
      this.div.style.direction = 'row'
    } else {
      this.div.style.direction = 'column'
    }
    this.div.innerHTML = (options || []).map(option => `<div> <input type="radio" name="${this.name}" value="${option.value}" ${option.value === value ? 'checke' : ''} /><label for="${option.value}">${option.label}</label></div>`).join('')

    this.div.style.color = color
    this.div.style.fontFamily = fontFamily
    this.div.style.fontSize = fontSize + 'px'
    this.div.className = (classNames || []).join(' ')
  }
}
