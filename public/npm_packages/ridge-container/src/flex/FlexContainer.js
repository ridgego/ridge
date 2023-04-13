import BaseContainer from '../BaseContainer'

export default class FlexBoxContainer extends BaseContainer {
  getContainerStyle () {
    const {
      // 相关系统变量
      direction = 'row',
      alignItems = 'stretch',
      gap = 0,
      justify = 'flex-start'
    } = this.props
    const containerStyle = {
      display: 'flex',
      flexDirection: direction,
      justifyContent: justify,
      alignItems,
      gap: gap + 'px'
    }
    return containerStyle
  }

  getChildStyle (wrapper) {
    const style = {}
    const configStyle = wrapper.config.style

    console.log('update child style ', configStyle)
    if (wrapper.config.props.styleMargin) {
      style.margin = wrapper.config.props.styleMargin
    } else {
      style.margin = 0
    }
    if (configStyle.flex) {
      style.flex = configStyle.flex
    } else {
      style.flex = ''
    }
    style.width = configStyle.width ? (configStyle.width + 'px') : ''
    style.height = configStyle.height ? (configStyle.height + 'px') : ''
    style.zIndex = 10
    return style
  }

  getShadowStyle (configStyle) {
    const shadowStyle = {}
    if (configStyle) {
      if (configStyle.flex) {
        shadowStyle.flex = configStyle.flex
      }
    }
    return shadowStyle
  }

  // 拖拽一个矩形到容器上，判断将其插入到哪个位置
  getAfterNode (droppedRect, siblings) {
    const { direction } = this.props
    const pos = (direction === 'row') ? (droppedRect.x + droppedRect.width / 2) : (droppedRect.y + droppedRect.height / 2)
    let last = 10000000000
    let result = null
    for (const sibling of siblings) {
      if (sibling.classList.contains('drop-shadow')) {
        continue
      }
      const siblingRect = sibling.getBoundingClientRect()
      const siblingpos = (direction === 'row') ? (siblingRect.x + siblingRect.width / 2) : (siblingRect.y + siblingRect.height / 2)
      if (pos < siblingpos && siblingpos < last) {
        last = siblingpos
        result = sibling
      }
    }
    return result
  }
}
