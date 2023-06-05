// Container Methods
class Container {
  constructor (props) {
    this.props = props
  }

  async mount (el) {} // 挂载
  isDroppable () {} // 是否可以放入
  onDragOver (wrapper) {} // 拖动进入
  onDragOut () {} // 拖动离开
  getChildren () {} // ?
  appendChild (el, x, y) {} // 增加
  removeChild (el, isDelete) {} // 移除
  updateChildStyle () {}
  update (props) {}
}
export default Container
