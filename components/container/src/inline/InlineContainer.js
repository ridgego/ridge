import BaseContainer from '../BaseContainer'
/**
 * 流式容器，HTML默认的布局方式
 */
export default class RowContainer extends BaseContainer {
  getContainerStyle (props) {
    const containerStyle = {
      width: '100%',
      lineHeight: this.props.lineHeight + 'px',
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

    shadowStyle.display = 'inline-block'
    shadowStyle.height = configStyle.height + 'px'
    shadowStyle.width = configStyle.width + 'px'
    shadowStyle.marginLeft = configStyle.marginLeft + 'px'

    return shadowStyle
  }

  getAfterNode (droppedRect, siblings) {
    return null
  }
}
