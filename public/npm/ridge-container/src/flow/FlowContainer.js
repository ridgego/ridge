import BaseContainer from '../BaseContainer'

export default class FlowContainer extends BaseContainer {
  getContainerStyle () {
    const {
      // 相关系统变量
      border,
      padding,
      rectStyle
    } = this.props
    const containerStyle = {
      border,
      boxSizing: 'border-box',
      padding: padding + 'px'
    }

    Object.assign(containerStyle, rectStyle)
    return containerStyle
  }

  getChildStyle (view) {
    const style = this.getResetStyle()

    if (view.config.style.block) {
      style.display = 'block'
    } else {
      style.display = 'inline-block'
    }

    if (view.config.style.margin) {
      style.margin = view.config.style.margin
    } else {
      style.margin = 0
    }
    return style
  }
}
