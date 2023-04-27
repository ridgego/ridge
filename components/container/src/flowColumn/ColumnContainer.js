import { border } from 'ridge-prop-utils'
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
    Object.assign(containerStyle, border.style(this.props))
    return containerStyle
  }

  getChildStyle (wrapper) {
    return this.getShadowStyle(wrapper.config.style)
  }

  getShadowStyle (configStyle) {
    const shadowStyle = {}

    shadowStyle.height = configStyle.height ? (configStyle.height + 'px') : ''
    if (configStyle.center) {
      shadowStyle.margin = '0 auto'
    } else {
      shadowStyle.margin = ''
    }

    if (configStyle.fullwidth) {
      shadowStyle.width = '100%'
    } else {
      shadowStyle.width = configStyle.width + 'px'
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
