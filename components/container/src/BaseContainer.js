/**
 * @abstract BaseContainer
 * 容器基础实现，包含通用配置及方法
 */
export default class BaseContainer {
  constructor (props) {
    this.props = props
    this.isRuntime = props.__mode !== 'edit'
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
  getAfterNode (droppedRect, siblings) {
    return null
  }

  mounted () {}

  async mount (el) {
    this.el = el
    const containerDiv = document.createElement('div')
    this.containerEl = containerDiv

    this.containerEl.className = (this.props.classNames || []).join(' ')

    el.appendChild(containerDiv)

    this.wrapper = this.props.__elementWrapper
    this.mode = this.props.__mode
    Object.assign(this.containerEl.style, {
      width: '100%',
      height: '100%'
    }, this.getContainerStyle())

    if (this.props.children) {
      for (const childWrapper of this.props.children) {
        const childDiv = document.createElement('div')
        this.containerEl.appendChild(childDiv)
        await childWrapper.loadAndMount(childDiv)
        this.updateChildStyle(childWrapper)
      }
    }
    await this.mounted()
  }

  /**
   * 计算并更新子节点样式
   * @param  {ElementWrapper} wrapper 封装类
   */
  updateChildStyle (wrapper, originalRect) {
    const style = Object.assign({}, wrapper.getResetStyle(), this.getChildStyle(wrapper, originalRect))

    Object.assign(wrapper.el.style, style)
  }

  // 追加子节点
  appendChild (wrapper, x, y) {
    const el = wrapper.el

    let originalRect = el.getBoundingClientRect()

    if (el.parentElement == null) {
      originalRect = {
        x: x - (wrapper.config.style.width || 100) / 2,
        y: y - (wrapper.config.style.height || 100) / 2,
        width: wrapper.config.style.width || 100,
        height: wrapper.config.style.height || 100
      }
    }
    if (el.parentElement !== this.containerEl) {
      if (this.containerEl.querySelector(':scope > .drop-shadow')) {
        this.containerEl.insertBefore(el, this.containerEl.querySelector(':scope > .drop-shadow'))
        this.containerEl.removeChild(this.containerEl.querySelector(':scope > .drop-shadow'))
      } else {
        this.containerEl.appendChild(el)
      }
      this.updateChildStyle(wrapper, originalRect)
    }
    return {
      children: this.getChildren()
    }
  }

  // 删除子节点
  removeChild (wrapper, isDelete) {
    // 原地阴影
    if (wrapper.el.parentElement === this.containerEl) {
      if (!isDelete) {
        this.checkInsertDropShadowEl(wrapper.el.getBoundingClientRect(), wrapper.el, wrapper.config.style)
      }
      this.containerEl.removeChild(wrapper.el)
    } else {
      console.warn('not children ')
    }
    return {
      children: this.getChildren()
    }
  }

  // 在指定位置创建或确认现有放置阴影层
  checkInsertDropShadowEl (rect, afterNode, configStyle) {
    const existedNode = this.containerEl.querySelector(':scope > .drop-shadow')

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
      this.checkInsertDropShadowEl(wrapper.getConfig().style, afterNode, wrapper.config.style)
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
    return Array.from(this.containerEl.childNodes).filter(el => el.classList.contains('ridge-element')).map(el => {
      return el.elementWrapper.id
    }).filter(e => e != null)
  }

  /**
   * 按属性联动方法
   * @param {*} props
   */
  update (props) {
    this.props = props
    Object.assign(this.containerEl.style, this.getContainerStyle())

    this.containerEl.className = (this.props.classNames || []).join(' ')
    if (this.props.children) {
      for (const childWrapper of this.props.children) {
        childWrapper.forceUpdate()
      }
    }
  }
}
