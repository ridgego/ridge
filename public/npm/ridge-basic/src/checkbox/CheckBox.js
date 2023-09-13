export default class CheckBox {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    // <input class="task-status" type="checkbox" checked="true" data-id="-1">
    this.input = document.createElement('input')
    this.input.type = 'checkbox'
    if (this.props.value != null) {
      this.input.checked = this.props.value
    }
    this.el.append(this.input)
    this.input.onchange = (e) => {
      this.props.input && this.props.input(e.currentTarget.value)
      this.props.onChange && this.props.onChange(e.currentTarget.value)
    }
    Object.assign(this.input.style, this.getStyle())
  }

  getStyle () {
    // appearance: none;
    // width: 18px;
    // height: 18px;
    // cursor: pointer;
    // border: 2px solid #bbbdc7;
    // border-radius: 50%;
    // background-color: #fff;
    // margin-right: 10px;
    // position: relative;

    // background-image: url(data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='405.272' height='405.272'%3e%3cpath d='M393.401 124.425L179.603 338.208c-15.832 15.835-41.514 15.835-57.361 0L11.878 227.836c-15.838-15.835-15.838-41.52 0-57.358 15.841-15.841 41.521-15.841 57.355-.006l81.698 81.699L336.037 67.064c15.841-15.841 41.523-15.829 57.358 0 15.835 15.838 15.835 41.514.006 57.361z' fill='%23fff'/%3e%3c/svg%3e);
    // background-size: 10px;
    // background-color: #4acea3;
    // border-color: #38bb90;
    // background-repeat: no-repeat;
    // background-position: center;

    const style = {
      width: '100%',
      height: '100%',
      cursor: 'pointer',
      boxSizing: 'border-box',
      appearance: 'none',
      borderRadius: this.props.borderRadius + 'px',
      border: this.props.border,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundImage: '',
      margin: 0,
      backgroundColor: this.props.backgroundColor
    }
    if (this.input.checked) {
      style.backgroundColor = this.props.backgroundColorChecked
      style.backgroundSize = '83%'
      style.backgroundImage = 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'405.272\' height=\'405.272\'%3e%3cpath d=\'M393.401 124.425L179.603 338.208c-15.832 15.835-41.514 15.835-57.361 0L11.878 227.836c-15.838-15.835-15.838-41.52 0-57.358 15.841-15.841 41.521-15.841 57.355-.006l81.698 81.699L336.037 67.064c15.841-15.841 41.523-15.829 57.358 0 15.835 15.838 15.835 41.514.006 57.361z\' fill=\'%23fff\'/%3e%3c/svg%3e")'
    }
    if (this.props.fontSize) {
      style.fontSize = this.props.fontSize + 'px'
    }

    return style
  }

  update (props) {
    Object.assign(this.props, props)
    if (this.props.value != null) {
      this.input.checked = this.props.value
    }
    Object.assign(this.input.style, this.getStyle())
  }
}
