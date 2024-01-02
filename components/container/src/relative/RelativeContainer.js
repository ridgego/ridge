import BaseContainer from '../BaseContainer'

export default class RelativeContainer extends BaseContainer {
  getContainerStyle () {
    const { border } = this.props
    const containerStyle = {
      width: '100%',
      height: '100%',
      border,
      boxSizing: 'border-box',
      position: 'relative'
    }
    return containerStyle
  }

  onChildAppended (element, { x, y }) {
    // 因为子节点是从外部拖入，其xy 都是相对于根的，这里根据传入的相对当前父的xy做更新
    element.updateConfig({
      style: { left: x + 'px', top: y + 'px', right: '', bottom: '', width: element.config.style.width, height: element.config.style.height }
    }, true)
  }

  onChildRemoved (element) {

  }

  getChildStyle (element) {
    const style = this.getResetStyle()
    const configStyle = element.config.style
    if (this.isRuntime) {
      // 运行时安编辑态值计算出相对
      style.position = 'absolute'
      Object.assign(style, configStyle)

      if (configStyle.left && configStyle.right) {
        style.width = 'auto'
      } else {
        style.width = configStyle.width + 'px'
      }
      style.height = configStyle.height + 'px'
    } else {
      style.position = 'absolute'
      Object.assign(style, configStyle)
      style.width = configStyle.width + 'px'
      style.height = configStyle.height + 'px'

      if (configStyle.left && configStyle.right) {
        style.width = 'auto'
      } else {
        style.width = configStyle.width + 'px'
      }
      if (configStyle.top && configStyle.bottom) {
        style.height = 'auto'
      } else {
        style.height = configStyle.height + 'px'
      }
    }
    return style
  }

  getChildStyle1 (wrapper, beforeRect) {
    if (beforeRect) { // 刚从外部放入
      const rect = this.containerEl.getBoundingClientRect()
      const zoom = rect.width / this.wrapper.config.style.width

      const computedStyle = window.getComputedStyle(this.containerEl)
      const borderTopWidth = parseInt(computedStyle.borderTopWidth) || 0
      const borderLeftWidth = parseInt(computedStyle.borderLeftWidth) || 0

      wrapper.config.style.position = 'absolute'
      wrapper.config.style.x = (beforeRect.x - rect.x - borderTopWidth) / zoom
      wrapper.config.style.y = (beforeRect.y - rect.y - borderLeftWidth) / zoom
      return {
        position: 'absolute',
        transform: `translate(${wrapper.config.style.x}px, ${wrapper.config.style.y}px)`
      }
    } else {
      if (this.isRuntime) {
        const newPos = this.position(this.wrapper.config.style, wrapper.config.style, this.containerEl.getBoundingClientRect(), wrapper.config.style.relative || [])
        return {
          position: 'absolute',
          width: newPos.width + 'px',
          height: newPos.height + 'px',
          transform: `translate(${newPos.x}px, ${newPos.y}px)`
        }
      } else {
        return {
          position: 'absolute',
          transform: `translate(${wrapper.config.style.x}px, ${wrapper.config.style.y}px)`,
          width: wrapper.config.style.width + 'px',
          height: wrapper.config.style.height + 'px'
        }
      }
    }
  }
}
