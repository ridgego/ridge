export default class BulmaBase {
  constructor (props) {
    this.props = props
  }

  isDroppable () {
    return false
  }

  onDragOver () {

  }

  random (length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

    let str = ''
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return str
  }

  async mount (el) {
    this.el = el

    this.el.innerHTML = this.innerHTML(this.props)
    this.mounted()
  }

  innerHTML (props) {
    return <div>Should Extend innerHTML</div>
  }

  update (props) {
    this.props = props
    this.el.innerHTML = this.innerHTML(props)
    this.mounted()
  }

  mounted () {

  }
}
