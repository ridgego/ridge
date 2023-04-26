import { border } from 'ridge-prop-utils'

/**
 * @abstract BaseContainer
 * 容器基础实现，包含通用配置及方法
 */
export default class BaseContainer {
  constructor (props) {
    this.props = props
  }

  /**
   * 获取容器样式
   * @abstract
   */
  getContainerStyle () {}

  /**
   * 子节点style信息
   * @abstract
   */
  getChildStyle (wrapper) {}

  /**
   * 获取shadow样式
   * @abstract
   */
  getShadowStyle () {}

  /**
   * 判断元素是否属于插槽节点
   * @abstract
   */
  isSlot (el) { return false }

  /**
   * 获取插槽属性
   * @abstract
   */
  getSlotProps () { return {} }

  /**
     * 拖拽一个矩形到容器上，判断将其插入到哪个位置
     * @param {*} droppedRect
     * @param {*} siblings
     * @abstract
     */
  getAfterNode (droppedRect, siblings) {}

  async mount (el) {
    const containerDiv = document.createElement('div')
    containerDiv.classList.add(this.className)
    el.appendChild(containerDiv)

    this.containerEl = containerDiv
    this.mode = this.props.__mode
    Object.assign(this.containerEl.style, {
      width: '100%',
      height: '100%'
    }, border.style(this.props), this.getContainerStyle())

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
    const style = Object.assign({}, wrapper.getResetStyle(), this.getChildStyle(wrapper))

    Object.assign(wrapper.el.style, style)
  }

  // 追加子节点
  appendChild (wrapper) {
    const el = wrapper.el
    if (el.parentElement !== this.containerEl) {
      if (this.containerEl.querySelector(':scope > .drop-shadow')) {
        this.containerEl.insertBefore(el, this.containerEl.querySelector(':scope > .drop-shadow'))
        this.containerEl.removeChild(this.containerEl.querySelector(':scope > .drop-shadow'))
      }
      this.updateChildStyle(wrapper)
    }
    if (this.isSlot(el)) {
      return this.getSlotProps()
    } else {
      return {
        children: this.getChildren()
      }
    }
  }

  // 删除子节点
  removeChild (wrapper) {
    const el = wrapper.el
    // 原地阴影
    if (wrapper.el.parentElement === this.containerEl) {
      this.checkInsertDropShadowEl(wrapper.el.getBoundingClientRect(), wrapper.el, wrapper.config.style)
      this.containerEl.removeChild(wrapper.el)
    } else {
      console.warn('not children ')
    }
    if (this.isSlot(wrapper.el)) {
      return {

      }
    } else {
      return {
        children: this.getChildren()
      }
    }
  }

  // 在指定位置创建或确认现有放置阴影层
  checkInsertDropShadowEl (rect, afterNode, configStyle) {
    const existedNode = this.containerEl.querySelector(':scope > .drop-shadow')

    console.log(existedNode, afterNode)
    if (existedNode && existedNode.nextElementSibling === afterNode) {
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

    Object.assign(shadowNode.style, this.getShadowStyle(configStyle))

    if (afterNode == null) {
      this.containerEl.appendChild(shadowNode)
    } else {
      this.containerEl.insertBefore(shadowNode, afterNode)
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
      this.checkInsertDropShadowEl(wrapper, afterNode, wrapper)
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

    if (this.props.children) {
      for (const childWrapper of this.props.children) {
        childWrapper.forceUpdate()
      }
    }
  }
}
