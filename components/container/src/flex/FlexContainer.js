export default class FlexBoxContainer {
  constructor (props) {
    this.props = props
  }

  getContainerStyle (props) {
    const {
      // 相关系统变量
      padding,
      direction = 'row',
      alignItems = 'stretch',
      justify = 'flex-start',
      border
    } = props
    const containerStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      border,
      flexDirection: direction,
      justifyContent: justify,
      alignItems,
      padding
    }
    return containerStyle
  }

  mount (el) {
    const containerDiv = document.createElement('div')
    containerDiv.classList.add('flex-container')
    Object.assign(containerDiv.style, this.getContainerStyle(this.props))
    this.containerEl = containerDiv
    el.appendChild(containerDiv)
  }

  getChildren () {

  }

  appendChild (el) {
    const {
      // 相关系统变量
      direction = 'row',
      alignItems = 'stretch'
    } = this.props

    // 获取当前放置的次序
    const afterNode = this.getAfterNode(el, this.containerEl.childNodes, direction)
    const style = {
      position: 'static'
    }
    if (direction === 'row' && alignItems === 'stretch') {
      style.height = ''
    }
    if (direction === 'column' && alignItems === 'stretch') {
      style.width = ''
    }
    el.elementWrapper.setStyle(style)
    if (afterNode) {
      this.containerEl.insertBefore(el, afterNode)
    } else {
      this.containerEl.appendChild(el)
    }
  }

  getAfterNode (dropped, siblings, row) {
    const droppedRect = dropped.getBoundingClientRect()
    const pos = (row === 'row') ? (droppedRect.x + droppedRect.width / 2) : (droppedRect.y + droppedRect.height / 2)
    let last = 10000000000
    let result = null
    for (const sibling of siblings) {
      const siblingRect = sibling.getBoundingClientRect()
      const siblingpos = (row === 'row') ? (siblingRect.x + siblingRect.width / 2) : (siblingRect.y + siblingRect.height / 2)
      if (pos < siblingpos && siblingpos < last) {
        last = siblingpos
        result = sibling
      }
    }
    return result
  }
}
