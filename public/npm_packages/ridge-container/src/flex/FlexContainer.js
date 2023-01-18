import bordered from '../bordered.d'

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
    Object.assign(containerStyle, bordered.style(props))
    return containerStyle
  }

  mount (el) {
    const containerDiv = document.createElement('div')
    containerDiv.classList.add('flex-container')
    Object.assign(containerDiv.style, this.getContainerStyle(this.props))
    el.appendChild(containerDiv)

    this.containerEl = containerDiv
    if (this.props.children) {
      for (const childWrapper of this.props.children) {
        const childDiv = document.createElement('div')
        containerDiv.appendChild(childDiv)

        childWrapper.mount(childDiv)

        Object.assign(childDiv.style, this.getChildrenWrapperStyle(childWrapper))
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
    if (wrapper.config.props.flex) {
      style.flex = wrapper.config.props.flex
    } else {
      style.flex = ''
    }
  }

  appendChild (wrapper) {
    const el = wrapper.el
    const {
      // 相关系统变量
      direction = 'row',
      alignItems = 'stretch'
    } = this.props

    // 获取当前放置的次序
    const afterNode = this.getAfterNode(el, this.containerEl.childNodes, direction)
    const style = {
      position: 'relative',
      left: 0,
      top: 0
    }

    if (direction === 'row' && alignItems === 'stretch') {
      style.height = ''
    }
    if (direction === 'column' && alignItems === 'stretch') {
      style.width = ''
    }

    Object.assign(style, this.getChildrenWrapperStyle(wrapper))
    if (afterNode) {
      this.containerEl.insertBefore(el, afterNode)
    } else {
      this.containerEl.appendChild(el)
    }

    wrapper.setStyle(style)
  }

  getAfterNode (dropped, siblings, row) {
    const droppedRect = dropped.getBoundingClientRect()
    const pos = (row === 'row') ? (droppedRect.x + droppedRect.width / 2) : (droppedRect.y + droppedRect.height / 2)
    let last = 10000000000
    let result = null
    for (const sibling of siblings) {
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
}
