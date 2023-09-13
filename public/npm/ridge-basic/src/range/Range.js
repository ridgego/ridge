export default class Input {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.input = document.createElement('input')
    this.el.append(this.input)
    this.input.type = 'range'
    this.input.style.width = '100%'
    this.input.style.height = '100%'

    this.input.onchange = (e) => {
      this.props.onChange && this.props.onChange(e.currentTarget.value)
    }
    this.render()
  }

  update (props) {
    this.props = props
    this.render()
  }

  render () {
    const { value, min, max, className } = this.props
    this.input.value = value
    this.input.min = min
    this.input.max = max
    this.input.className = className
  }
}
