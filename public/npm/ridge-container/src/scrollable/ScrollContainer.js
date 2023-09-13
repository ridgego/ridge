import BaseContainer from '../BaseContainer'

export default class ScrollContainer extends BaseContainer {
  mounted () {

  }

  getContainerStyle () {
    const {
      overflowX,
      overflowY,
      __mode
    } = this.props
    const containerStyle = {}

    if (__mode === 'edit') {
      containerStyle.overflow = 'auto'
    } else {
      containerStyle.overflowX = overflowX ? 'auto' : ''
      containerStyle.overflowY = overflowY ? 'auto' : ''
    }

    return containerStyle
  }

  getChildStyle (wrapper) {
    const configStyle = wrapper.config.style
    return {
      width: configStyle.width ? (configStyle.width + 'px') : '',
      height: configStyle.height ? (configStyle.height + 'px') : ''
    }
  }

  getShadowStyle (configStyle) {
    return {
      width: '100%',
      height: '100%'
    }
  }

  // 拖拽一个矩形到容器上，判断将其插入到哪个位置
  getAfterNode (droppedRect, siblings) {
    return null
  }
}
