import { border } from 'ridge-prop-utils'

/**
 * 流式容器，HTML默认的布局方式
 */
export default class ColumnContainer {
  constructor (props) {
    this.props = props
  }

  getContainerStyle () {
    const containerStyle = {
      width: '100%',
      height: '100%'
    }
    Object.assign(containerStyle, border.style(this.props))
    return containerStyle
  }

  async mount (el) {
    const containerDiv = document.createElement('div')
    containerDiv.classList.add('flow-column-container')
    el.appendChild(containerDiv)

    this.containerEl = containerDiv
    this.mode = this.props.__mode
    Object.assign(this.containerEl.style, this.getContainerStyle())

    if (this.props.children) {
      for (const childWrapper of this.props.children) {
        const childDiv = document.createElement('div')
        containerDiv.appendChild(childDiv)
        await childWrapper.mount(childDiv)
        this.updateChildStyle(childWrapper)
      }
    }
  }

  /**
   * 计算并更新子节点样式
   * @param  {ElementWrapper} wrapper 封装类
   */
  updateChildStyle (wrapper) {
    const style = Object.assign({}, wrapper.getResetStyle())
    style.position = 'static'
    const configStyle = wrapper.config.style

    if (configStyle.maxWidth) {
      style.maxWidth = wrapper.config.style.maxWidth + 'px'
    }

    if (configStyle.center) {
      style.margin = '0 auto'
    } else {
      style.margin = ''
    }

    // block && inline-block
    style.display = configStyle.display

    style.width = configStyle.width ? (configStyle.width + 'px') : ''
    style.height = configStyle.height ? (configStyle.height + 'px') : ''
    Object.assign(wrapper.el.style, style)
  }

  appendChild (wrapper) {
    const el = wrapper.el
    if (el.parentElement !== this.containerEl) {
      if (this.containerEl.querySelector(':scope > .drop-shadow')) {
        this.containerEl.insertBefore(el, this.containerEl.querySelector(':scope > .drop-shadow'))
        this.containerEl.removeChild(this.containerEl.querySelector(':scope > .drop-shadow'))
      }

      this.updateChildStyle(wrapper)
    }
  }

  removeChild (wrapper) {
    this.checkInsertDropShadowEl(wrapper.el.getBoundingClientRect(), wrapper.el, wrapper.config.style)
    this.containerEl.removeChild(wrapper.el)
  }

  checkInsertDropShadowEl (rect, afterNode, configStyle) {
    const existedNode = this.containerEl.querySelector(':scope > .drop-shadow')
    if (existedNode && existedNode.nextSibling === afterNode) {
      return
    }
    if (existedNode) {
      this.containerEl.removeChild(existedNode)
    }

    const shadowNode = document.createElement('div')
    shadowNode.classList.add('drop-shadow')
    shadowNode.style.width = rect.width + 'px'
    shadowNode.style.height = rect.height + 'px'

    shadowNode.style.borderRadius = 'var(--semi-border-radius-small)'
    shadowNode.style.border = '2px dashed var(--semi-color-primary)'
    shadowNode.style.backgroundColor = 'var(--semi-color-primary-light-default)'

    if (configStyle) {
      if (configStyle.maxWidth) {
        shadowNode.style.maxWidth = configStyle.maxWidth + 'px'
        if (configStyle.center) {
          shadowNode.style.margin = '0 auto'
        } else {
          shadowNode.style.margin = ''
        }
      }
    }

    shadowNode.style.display = 'block'

    if (shadowNode.style.display === 'inline-block') {
      shadowNode.style.verticalAlign = 'bottom'
    }

    if (afterNode == null) {
      this.containerEl.appendChild(shadowNode)
    } else {
      this.containerEl.insertBefore(shadowNode, afterNode)
    }
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
  }

  // 拖拽上浮
  onDragOver (wrapper) {
    if (wrapper.el) { // 已有组件放置进入
      // 获取当前放置的次序
      const afterNode = this.getAfterNode(wrapper.el.getBoundingClientRect(), this.containerEl.childNodes)
      this.checkInsertDropShadowEl(wrapper.el.getBoundingClientRect(), afterNode, wrapper.config.style)
    } else { // 新增组件放置, 这种情况下 Wrapper只是一个含有width/height的rect对象
      const afterNode = this.getAfterNode(wrapper, this.containerEl.childNodes)
      this.checkInsertDropShadowEl(wrapper, afterNode)
    }
  }

  onDragOut () {
    if (this.containerEl.querySelector(':scope > .drop-shadow')) {
      this.containerEl.removeChild(this.containerEl.querySelector(':scope > .drop-shadow'))
    }
  }

  updateChild (wrapper) {
    this.updateChildStyle(wrapper)
  }

  getChildren () {
    return Array.from(this.containerEl.childNodes).map(el => {
      return el.elementWrapper
    }).filter(e => e != null)
  }

  /**
   * 按属性联动方法
   * @param {*} props
   */
  update (props) {
    this.props = props
    Object.assign(this.containerEl.style, this.getContainerStyle())
  }
}
