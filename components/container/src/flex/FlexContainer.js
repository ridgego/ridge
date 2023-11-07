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

  appendChild (view) {
    this.onDragOut()
    const el = view.el
    this.containerEl.appendChild(el)
    this.updateChildStyle(view)
    return true
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
