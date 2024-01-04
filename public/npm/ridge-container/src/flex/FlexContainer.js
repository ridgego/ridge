import BaseContainer from '../BaseContainer'

export default class FlexBoxContainer extends BaseContainer {
  getContainerStyle () {
    const {
      // 相关系统变量
      direction = 'row',
      alignItems = 'stretch',
      gap = 0,
      border,
      padding,
      justify = 'flex-start',
      rectStyle
    } = this.props
    const containerStyle = {
      display: 'flex',
      flexDirection: direction,
      justifyContent: justify,
      alignItems,
      border,
      boxSizing: 'border-box',
      padding: padding + 'px',
      gap: gap + 'px'
    }

    Object.assign(containerStyle, rectStyle)
    return containerStyle
  }

  // 放入一个新的rect后，根据位置放置其所在子节点的索引
  checkNodeOrder (rect) {
    const centerX = rect.x + rect.width / 2
    const centerY = rect.y + rect.height / 2
    const childNodes = this.containerEl.childNodes
    const {
      // 相关系统变量
      direction = 'row'
    } = this.props

    if (direction === 'row') {
      // 横向
      for (let i = 0; i < childNodes.length; i++) {
        const bc = childNodes[i].getBoundingClientRect()
        const compareX = bc.x + bc.width / 2
        if (compareX > centerX) {
          return i
        }
      }
    } else if (direction === 'column') {
      // 纵向
      for (let i = 0; i < childNodes.length; i++) {
        const bc = childNodes[i].getBoundingClientRect()
        const compareY = bc.y + bc.height / 2
        if (compareY > centerY) {
          return i
        }
      }
    }
    return -1
  }

  getChildStyle (view) {
    const style = this.getResetStyle()
    const configStyle = view.config.style

    if (view.config.props.styleMargin) {
      style.margin = view.config.props.styleMargin
    } else {
      style.margin = 0
    }
    if (configStyle.flex) {
      style.flex = configStyle.flex
    } else {
      style.flex = ''
      if (this.props.direction === 'row') {
        style.width = configStyle.width ? (configStyle.width + 'px') : ''
      } else {
        style.height = configStyle.height ? (configStyle.height + 'px') : ''
      }
    }
    if (this.props.alignItems !== 'stretch') {
      if (this.props.direction === 'row') {
        style.height = configStyle.height ? (configStyle.height + 'px') : ''
      } else if (this.props.direction === 'column') {
        style.width = configStyle.width ? (configStyle.width + 'px') : ''
      }
    }
    return style
  }
}
