import BaseContainer from '../BaseContainer.js'
import './style.css'

/**
 * 内容切换显示容器
 */
export default class SwitchContainer extends BaseContainer {
  /**
   * 容器挂载
   * @param {*} el
   */
  async mounted () {
    this.containerEl.classList.add('switch-container')
    await this.toggleState()
  }

  /**
   * 切换到显示某个内容元素, 当未加载时,执行加载和初始化动作
   */
  async toggleState (index) {
    const { current } = this.props

    let currentIndex = current == null ? 0 : current
    if (index != null) {
      currentIndex = index
    }

    const childElements = this.containerEl.children
    for (let i = 0; i < childElements.length; i++) {
      if (i === currentIndex) {
        childElements[i].style.display = ''
      } else {
        childElements[i].style.display = 'none'
      }
    }
  }

  // Editor Only
  childSelected (childEl) {
    const childElements = this.getChildElements()

    this.toggleState(childElements.indexOf(childEl.el))
  }

  onChildRemoved () {
    this.toggleState()
  }

  onChildAppended (childView) {
    const childElements = this.getChildElements()
    this.toggleState(childElements.indexOf(childView.el))
  }

  updated () {
    this.toggleState()
    this.containerEl.classList.add('switch-container')
  }

  getChildStyle (view) {
    const style = this.getResetStyle()

    style.width = '100%'
    style.height = '100%'
    style.position = 'absolute'
    style.left = 0
    style.top = 0
    return style
  }

  onStyleUpdated () {
    this.containerEl.style.position = 'relative'
  }
}
