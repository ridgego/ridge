import BaseContainer from '../BaseContainer'

const styleSize = len => {
  if (typeof len === 'number') {
    return len + 'px'
  } else if (typeof len === 'string' && len.match(/^[0-9]+$/)) {
    return len + 'px'
  } else {
    return len
  }
}

export default class FlowContainer extends BaseContainer {
  getContainerStyle () {
    const {
      // 相关系统变量
      padding,
      rectStyle
    } = this.props
    const containerStyle = {
      boxSizing: 'border-box',
      padding: padding + 'px'
    }

    Object.assign(containerStyle, rectStyle)
    return containerStyle
  }

  updateChildStyleConfig (style) {
    console.log('updateChildStyleConfig', style)
    return style
  }

  // 放入一个新的rect后，根据位置放置其所在子节点的索引
  checkNodeOrder (rect) {
    const centerX = rect.x + rect.width / 2
    const centerY = rect.y + rect.height / 2
    const childNodes = this.containerEl.childNodes

    let before = -1
    // 横向
    for (let i = childNodes.length - 1; i >= 0; i--) {
      const bc = childNodes[i].getBoundingClientRect()
      const compareX = bc.x + bc.width / 2
      const compareY = bc.y + bc.height / 2

      if (compareX > centerX && compareY > centerY) {
        before = i
      }
    }
    return before
  }

  getChildStyle (view) {
    const style = this.getResetStyle()

    if (view.config.style.block) {
      style.display = 'block'
    } else {
      style.display = 'inline-block'
    }

    style.width = styleSize(view.config.style.width)
    style.height = styleSize(view.config.style.height)

    if (view.config.style.margin) {
      style.margin = view.config.style.margin
    } else {
      style.margin = 0
    }
    return style
  }
}
