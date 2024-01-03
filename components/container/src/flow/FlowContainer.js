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

  updateChildStyleConfig (style) {
    console.log('updateChildStyleConfig', style)
    return style
  }

  getChildStyle (view) {
    const style = this.getResetStyle()

    if (view.config.style.block) {
      style.display = 'block'
    } else {
      style.display = 'inline-block'
    }

    if (view.config.style.width) {
      style.width = view.config.style.width + 'px'
    }
    if (view.config.style.height) {
      style.height = view.config.style.height + 'px'
    }

    if (view.config.style.margin) {
      style.margin = view.config.style.margin
    } else {
      style.margin = 0
    }
    return style
  }
}
