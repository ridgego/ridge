import { words } from 'lodash'
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
    this.previousSize = containerDiv.getBoundingClientRect()
    this.wrapper = this.props.__elementWrapper
    this.mode = this.wrapper.pageManager.mode

    if (this.props.children) {
      for (const childWrapper of this.props.children) {
        const childDiv = document.createElement('div')
        containerDiv.appendChild(childDiv)
        this.positionChild(childWrapper, this.wrapper.config.style)

        await childWrapper.mount(childDiv)
        // Object.assign(childDiv.style, this.getChildrenWrapperStyle(childWrapper))
      }
    }

    this.resizeObserver = new window.ResizeObserver((entries) => {
      console.log('resize', entries, this)

      if (this.props.children) {
        for (const childWrapper of this.props.children) {
          this.positionChild(childWrapper, this.previousSize)
          childWrapper.updateStyle()
          // Object.assign(childDiv.style, this.getChildrenWrapperStyle(childWrapper))
        }
      }
      this.previousSize = this.containerEl.getBoundingClientRect()
    })

    this.resizeObserver.observe(this.containerEl)
  }

  updateStyle (style) {
    console.log('update style', style)
  }

  /**
   * 更新子节点按照新的容器范围的rect位置
   * @param {*} originalContainer
   * @param {*} originalChild
   * @param {*} currentContainer
   * @param {*} pos
   * @returns
   */
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

  /**
   * 对子节点根据当前容器矩形范围进行重新定位， 传入旧的容器矩形范围
   * @param {*} childWrapper 子节点容器
   * @param {*} originalStyle 旧的容器矩形范围
   */
  positionChild (childWrapper, originalStyle) {
    const configStyle = childWrapper.config.style
    const containerRect = this.containerEl.getBoundingClientRect()

    const positioning = childWrapper.config.style.relative || []
    const targetStyle = this.position(originalStyle, configStyle, containerRect, positioning)

    if (this.mode === 'edit') {
      childWrapper.setConfigStyle(targetStyle)
    } else {
      Object.assign(childWrapper.style, targetStyle)
    }
  }

  /**
   * 更新子节点(位置)
   * @param {*} wrapper
   */
  updateChild (wrapper, rect) {
    const childbc = rect || wrapper.el.getBoundingClientRect()
    const containerbc = this.containerEl.getBoundingClientRect()
    const borderWidth = parseInt(window.getComputedStyle(this.containerEl).borderWidth) || 0
    wrapper.setConfigStyle({
      position: 'absolute',
      x: childbc.x - containerbc.x - borderWidth,
      y: childbc.y - containerbc.y - borderWidth
    })
  }

  appendChild (wrapper, x, y) {
    const el = wrapper.el
    if (el.parentElement !== this.containerEl) {
      const containerbc = this.containerEl.getBoundingClientRect()
      this.containerEl.appendChild(el)
      const childbc = el.getBoundingClientRect()
      wrapper.setConfigStyle({
        position: 'absolute',
        x: x - containerbc.x - (childbc.width) / 2,
        y: y - containerbc.y - (childbc.height) / 2
      })
    }
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
