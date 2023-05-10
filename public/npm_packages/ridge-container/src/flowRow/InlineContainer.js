import { border } from 'ridge-prop-utils'


/**
 * 流式容器，HTML默认的布局方式
 */
export default class RowContainer {
  getContainerStyle (props) {
    const containerStyle = {
      width: '100%',
      height: '100%'
    }
    Object.assign(containerStyle, border.style(props))
    return containerStyle
  }

  async mount (el) {
    const containerDiv = document.createElement('div')
    containerDiv.classList.add('flow-row-container')
    el.appendChild(containerDiv)

    this.containerEl = containerDiv
    this.mode = this.props.__mode

    if (this.props.children) {
      for (const childWrapper of this.props.children) {
        const childDiv = document.createElement('div')
        containerDiv.appendChild(childDiv)
        await childWrapper.mount(childDiv)
        this.updateChildStyle(childWrapper)
      }
    }
  }

  updateStyle (style) {
    console.log('update style', style)
  }

  /**
   * 计算并更新子节点样式
   * @param  {ElementWrapper} wrapper 封装类
   */
  updateChildStyle (wrapper) {
    const style = Object.assign({}, wrapper.getResetStyle())
    style.position = 'static'
    const configStyle = wrapper.config.style

    // block && inline-block
    style.display = 'inline-block'

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
    this.containerEl.insertBefore(this.createDropShadowEl(wrapper), wrapper.el)
    this.containerEl.removeChild(wrapper.el)
  }

  createDropShadowEl (wrapper) {
    const shadowNode = document.createElement('div')
    shadowNode.classList.add('drop-shadow')
    shadowNode.style.width = wrapper.el.style.width
    shadowNode.style.height = wrapper.el.style.height

    shadowNode.style.borderRadius = 'var(--semi-border-radius-small)'
    shadowNode.style.border = '2px dashed var(--semi-color-primary)'
    shadowNode.style.backgroundColor = 'var(--semi-color-primary-light-default)'

    const configStyle = wrapper.config.style
    if (configStyle.maxWidth) {
      shadowNode.style.maxWidth = wrapper.config.style.maxWidth + 'px'
    }
    if (configStyle.center) {
      shadowNode.style.margin = '0 auto'
    } else {
      shadowNode.style.margin = ''
    }

    shadowNode.style.display = configStyle.display

    if (shadowNode.style.display === 'inline-block') {
      shadowNode.style.verticalAlign = 'bottom'
    }

    if (this.containerEl.querySelector(':scope > .drop-shadow')) {
      this.containerEl.removeChild(this.containerEl.querySelector(':scope > .drop-shadow'))
    }
    return shadowNode
  }

  getAfterNode (el, siblings) {
    const droppedRect = el.getBoundingClientRect()

    for (const sibling of siblings) {
      if (sibling.classList.contains('drop-shadow')) {
        continue
      }
      const sbrect = sibling.getBoundingClientRect()
      const siblingDspl = sibling.style.display
      const elDspl = el.elementWrapper ? el.elementWrapper.style.display : 'block'

      if (siblingDspl === 'block' || elDspl === 'block') {
        // 被对比节点是整行
        if (droppedRect.y < sbrect.y) {
          return sibling
        }
      } else {
        if (droppedRect.y < sbrect.y + sbrect.height && droppedRect.x < sbrect.x) {
          return sibling
        }
      }
    }
  }

  onDragOver (wrapper) {
    // 获取当前放置的次序
    const afterNode = this.getAfterNode(wrapper.el, this.containerEl.childNodes)

    console.log('flowContainer onDragOver', afterNode)
    // 最后一个
    if (afterNode == null) {
      this.containerEl.appendChild(this.createDropShadowEl(wrapper))
    } else {
      this.containerEl.insertBefore(this.createDropShadowEl(wrapper), afterNode)
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
    Object.assign(this.containerEl.style, this.getContainerStyle(this.props))
  }
}
