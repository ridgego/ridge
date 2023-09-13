export default class Title {
  constructor (props) {
    this.props = props
  }

  mount (el) {
    if (el) this.el = el
    this.el.innerHTML = this.innerHTML()
  }

  update (props) {
    this.props = props
    this.el.innerHTML = this.innerHTML()
  }

  innerHTML () {
    const { isSub, level, text } = this.props
    return `<p class="${isSub ? 'subtitle' : 'title'} ${level}">${text}</p>`
  }

  mounted () {
    Object.assign(this.el.querySelector('button').style, this.props.fontStyle)
    this.el.querySelector('button').onclick = () => {
      this.props.onClick && this.props.onClick()
    }
    // this.ensureButtonIcon()
  }

  updated () {
    Object.assign(this.el.querySelector('button').style, this.props.fontStyle)
    this.el.querySelector('button').onclick = () => {
      this.props.onClick && this.props.onClick()
    }
    // this.ensureButtonIcon()
  }
}
