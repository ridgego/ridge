import BaseContainer from '../BaseContainer'

/**
 * 流式容器，HTML默认的布局方式
 */
export default class ColumnContainer extends BaseContainer {
  getContainerStyle () {
    const containerStyle = {
      width: '100%',
      height: '100%'
    }
    Object.assign(containerStyle, this.props.rectStyle)
    return containerStyle
  }

  getChildStyle (wrapper) {
    return this.getShadowStyle(wrapper.config.style)
  }

  getShadowStyle (configStyle) {
    const shadowStyle = {}

    if (this.isRuntime) {
      shadowStyle.minHeight = configStyle.height ? (configStyle.height + 'px') : ''
      shadowStyle.height = ''
    } else {
      shadowStyle.height = configStyle.height ? (configStyle.height + 'px') : ''
    }
    if (configStyle.center) {
      shadowStyle.margin = '0 auto'
    } else {
      shadowStyle.margin = ''
    }

    if (configStyle.marginTop) {
      shadowStyle.marginTop = configStyle.marginTop + 'px'
    }

    if (configStyle.fullwidth) {
      shadowStyle.width = '100%'
    } else {
      if (this.isRuntime) {
        shadowStyle.maxWidth = configStyle.width + 'px'
        shadowStyle.width = ''
      } else {
        shadowStyle.width = configStyle.width + 'px'
      }
    }
    return shadowStyle
  }

  getAfterNode (droppedRect, siblings) {
    for (const sibling of siblings) {
      if (sibling.classList.contains('drop-shadow')) {
        continue
      }
      const sbrect = sibling.getBoundingClientRect()
      if (droppedRect.y < sbrect.y) {
        return sibling
      }
    }
    return null
  }
}
