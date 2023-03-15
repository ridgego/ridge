import { border } from 'ridge-prop-utils'

export default class RelativeContainer {
  constructor (props) {
    this.props = props
  }

  getContainerStyle (props) {
    const containerStyle = {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
    Object.assign(containerStyle, border.style(props))
    return containerStyle
  }

  async mount (el) {
    const containerDiv = document.createElement('div')
    containerDiv.classList.add('relative-container')
    Object.assign(containerDiv.style, this.getContainerStyle(this.props))
    el.appendChild(containerDiv)

    this.containerEl = containerDiv

    if (this.props.children) {
      for (const childWrapper of this.props.children) {
        const childDiv = document.createElement('div')
        containerDiv.appendChild(childDiv)
        this.positionChild(childWrapper)

        await childWrapper.mount(childDiv)
        // Object.assign(childDiv.style, this.getChildrenWrapperStyle(childWrapper))
      }
    }
  }

  position (originalContainer, originalChild, currentContainer, pos) {
    let positioning = JSON.parse(JSON.stringify(pos))
    const targetStyle = {}
    // 横向居中偏移
    if (positioning.indexOf('hcenter') > -1) {
      // 靠左靠右不生效
      positioning = positioning.filter(p => p !== 'left' || p !== 'right')
      const centerXDiff = originalContainer.width / 2 - (originalChild.width / 2 + originalChild.x)

      targetStyle.x = currentContainer.width / 2 - originalChild.width / 2 - centerXDiff
      targetStyle.width = originalChild.width
    }

    // 纵向居中偏移
    if (positioning.indexOf('vcenter') > -1) {
      // 靠上靠下不生效
      positioning = positioning.filter(p => p !== 'top' || p !== 'bottom')
      const centerYDiff = originalContainer.height / 2 - (originalChild.height / 2 + originalChild.y)

      targetStyle.y = currentContainer.height / 2 - originalChild.height / 2 - centerYDiff
      targetStyle.height = originalChild.height
    }

    // 同时靠左靠右
    if (positioning.indexOf('left') > -1 && positioning.indexOf('right') > -1) {
      targetStyle.x = originalChild.x
      targetStyle.width = originalChild.width + (currentContainer.width - originalContainer.width)
    } else if (positioning.indexOf('left') > -1) {
      targetStyle.x = originalChild.x
      targetStyle.width = originalChild.width
    } else if (positioning.indexOf('right') > -1) {
      targetStyle.x = currentContainer.width - (originalContainer.width - originalChild.x)
      targetStyle.width = originalChild.width
    } else {
      if (!targetStyle.x) {
        targetStyle.x = originalChild.x
      }
      if (!targetStyle.width) {
        targetStyle.width = originalChild.width
      }
    }

    if (positioning.indexOf('top') > -1 && positioning.indexOf('bottom') > -1) {
      targetStyle.y = originalChild.y
      targetStyle.height = originalChild.height + (currentContainer.height - originalContainer.height)
    } else if (positioning.indexOf('top') > -1) {
      targetStyle.y = originalChild.y
      targetStyle.height = originalChild.height
    } else if (positioning.indexOf('bottom') > -1) {
      targetStyle.y = currentContainer.height - originalContainer.height + originalChild.y
      targetStyle.height = originalChild.height
    } else {
      if (!targetStyle.y) {
        targetStyle.y = originalChild.y
      }
      if (!targetStyle.height) {
        targetStyle.height = originalChild.height
      }
    }

    return targetStyle
  }

  positionChild (childWrapper) {
    const containerStyle = this.props.__elementWrapper.config.style
    const configStyle = childWrapper.config.style
    const containerRect = this.containerEl.getBoundingClientRect()

    const positioning = childWrapper.config.style.relative || []
    const targetStyle = this.position(containerStyle, configStyle, containerRect, positioning)

    Object.assign(childWrapper.style, targetStyle)
  }

  updateChild (wrapper) {
    const childbc = wrapper.el.getBoundingClientRect()
    const containerbc = this.containerEl.getBoundingClientRect()
    const borderWidth = parseInt(window.getComputedStyle(this.containerEl).borderWidth) || 0
    wrapper.setConfigStyle({
      position: 'absolute',
      x: childbc.x - containerbc.x - borderWidth,
      y: childbc.y - containerbc.y - borderWidth
    })
  }

  appendChild (wrapper) {
    const el = wrapper.el
    this.containerEl.appendChild(el)
    this.updateChild(wrapper)
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
