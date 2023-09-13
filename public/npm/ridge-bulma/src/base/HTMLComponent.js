export default class HTMLComponent {
  constructor (props) {
    this.props = props
  }

  random (length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

    let str = ''
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return str
  }

  mounted () {}
  updateRuntime () {}
  innerHTML (props) {
    return <div>Should Extend innerHTML</div>
  }

  mount (el) {
    if (el) this.el = el

    this.el.innerHTML = this.innerHTML(this.props)
    this.mounted()
  }

  update (props) {
    this.props = props
    if (this.props.__mode === 'edit') {
      this.mount()
    } else {
      if (this.runtimeUpdate) {
        this.runtimeUpdate()
      } else {
        this.mount()
      }
    }
  }
}
