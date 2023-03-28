export default class BulmaBase {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el

    this.el.innerHTML = this.innerHTML(this.props)
  }

  innerHTML (props) {
    return <div>Should Extend innerHTML</div>
  }

  update (props) {
    this.el.innerHTML = this.innerHTML(props)
  }
}
