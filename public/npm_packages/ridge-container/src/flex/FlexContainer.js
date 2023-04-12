import { border } from 'ridge-prop-utils'

export default class FlexBoxContainer {
  constructor (props) {
    this.props = props
  }

  getContainerStyle (props) {
    const {
      // 相关系统变量
      direction = 'row',
      alignItems = 'stretch',
      gap = 0,
      justify = 'flex-start'
    } = props
    const containerStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: direction,
      justifyContent: justify,
      alignItems,
      gap: gap + 'px'
    }
    Object.assign(containerStyle, border.style(props))
    return containerStyle
  }

  async mount (el) {
    const containerDiv = document.createElement('div')
    containerDiv.classList.add('flex-container')
    Object.assign(containerDiv.style, this.getContainerStyle(this.props))
    el.appendChild(containerDiv)

    this.containerEl = containerDiv
    if (this.props.children) {
      for (const childWrapper of this.props.children) {
        const childDiv = document.createElement('div')
        containerDiv.appendChild(childDiv)

        await childWrapper.mount(childDiv)

        this.updateChildStyle(childWrapper)
      }
    }
  }

  updateChild (el) {
    this.appendChild(el)
  }

  getChildrenWrapperStyle (wrapper) {
    const style = {}
    if (wrapper.config.props.styleMargin) {
      style.margin = wrapper.config.props.styleMargin
    } else {
      style.margin = 0
    }
    if (wrapper.config.style.flex) {
      style.flex = wrapper.config.style.flex
    } else {
      style.flex = ''
    }
    style.zIndex = 10
    return style
  }

  appendChild (wrapper, x, y) {
    const el = wrapper.el
    const {
      // 相关系统变量
      direction = 'row'
    } = this.props

    if (this.containerEl.querySelector(':scope > .drop-shadow')) {
      this.containerEl.insertBefore(el, this.containerEl.querySelector(':scope > .drop-shadow'))
      this.containerEl.removeChild(this.containerEl.querySelector(':scope > .drop-shadow'))
    }
    // 获取当前放置的次序
    // const afterNode = this.getAfterNode(el, this.containerEl.childNodes, direction)

    // if (afterNode) {
    //   this.containerEl.insertBefore(el, afterNode)
    // } else {
    //   this.containerEl.appendChild(el)
    // }

    this.updateChildStyle(wrapper)
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

    if (this.containerEl.querySelector(':scope > .drop-shadow')) {
      this.containerEl.removeChild(this.containerEl.querySelector(':scope > .drop-shadow'))
    }
    return shadowNode
  }

  onDragOver (wrapper) {
    // 获取当前放置的次序
    const {
      direction = 'row'
    } = this.props

    const afterNode = this.getAfterNode(wrapper.el, this.containerEl.childNodes, direction)
    // 最后一个
    if (afterNode == null) {
      if (this.containerEl.lastChild && !this.containerEl.lastChild.classList.contains('drop-shadow')) {
        this.containerEl.appendChild(this.createDropShadowEl(wrapper))
      }
    } else {
      // if (afterNode.previousSibling && !afterNode.previousSibling.classList.contains('drop-shadow')) {
      this.containerEl.insertBefore(this.createDropShadowEl(wrapper), afterNode)
      // }
    }
  }

  onDragOut () {
    if (this.containerEl.querySelector(':scope > .drop-shadow')) {
      this.containerEl.removeChild(this.containerEl.querySelector(':scope > .drop-shadow'))
    }
  }

  getAfterNode (dropped, siblings, row) {
    const droppedRect = dropped.getBoundingClientRect()
    const pos = (row === 'row') ? (droppedRect.x + droppedRect.width / 2) : (droppedRect.y + droppedRect.height / 2)
    let last = 10000000000
    let result = null
    for (const sibling of siblings) {
      if (sibling.classList.contains('drop-shadow')) {
        continue
      }
      const siblingRect = sibling.getBoundingClientRect()
      const siblingpos = (row === 'row') ? (siblingRect.x + siblingRect.width / 2) : (siblingRect.y + siblingRect.height / 2)
      if (pos < siblingpos && siblingpos < last) {
        last = siblingpos
        result = sibling
      }
    }
    return result
  }

  update (properties) {
    this.props = properties
    Object.assign(this.containerEl.style, this.getContainerStyle(this.props))

    if (this.props.children) {
      for (const childWrapper of this.props.children) {
        childWrapper.forceUpdate()
      }
    }
  }

  getChildren () {
    return Array.from(this.containerEl.childNodes).map(el => {
      return el.elementWrapper
    }).filter(e => e != null)
  }

  /**
   * 计算并更新子节点样式
   * @param  {ElementWrapper} wrapper 封装类
   */
  updateChildStyle (wrapper) {
    const style = Object.assign({}, wrapper.getResetStyle())

    const configStyle = wrapper.config.style
    if (configStyle.styleMargin) {
      style.margin = configStyle.styleMargin
    } else {
      style.margin = 0
    }

    style.flex = configStyle.flex
    style.width = configStyle.width ? (configStyle.width + 'px') : ''
    style.height = configStyle.height ? (configStyle.height + 'px') : ''
    Object.assign(wrapper.el.style, style)
  }
}
