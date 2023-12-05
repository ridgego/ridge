import './style.css'

/**
 * @abstract BaseContainer
 * 容器基础实现，包含通用配置及方法
 */
export default class BaseContainer {
  constructor (props) {
    this.props = props
    // 更新时同时强制更新子节点
    this.forceUpdateChildren = true
  }

  /**
   * 基础挂载后子组件初始化动作
   */
  mounted () {}

  /**
   * 属性更新后触发
   **/
  updated () { }

  /**
   * 子节点移除后触发
   */
  onChildRemoved () {}

  /**
   * 子节点添加后触发
   */
  onChildAppended () {}
  /**
 * 获取容器样式
 * @abstract
 */
  getContainerStyle () {}

  /**
   * 子节点style信息
   * @abstract
   */
  getChildStyle (view) {}

  /**
   * 组件挂载到给定Element
   */
  async mount (el) {
    this.el = el
    this.containerEl = document.createElement('div')

    for (const className of this.props.classNames ?? []) {
      this.containerEl.classList.add(className)
    }

    el.appendChild(this.containerEl)

    // 编辑器之下，属性有__isEdit
    this.isRuntime = !this.props.__isEdit
    Object.assign(this.containerEl.style, {
      width: '100%',
      height: '100%'
    }, this.getContainerStyle())
    this.children = this.props.children
    if (this.children) {
      for (const childNode of this.children) {
        const div = document.createElement('div')
        this.containerEl.appendChild(div)
        await childNode.mount(div)
        this.updateChildStyle(childNode)
      }
    }
    await this.mounted()
  }

  unmountChildren () {
    for (const child of this.children) {
      child.unmount()
    }
  }

  /**
   * 增加子节点
   */
  appendChild (childNode) {
    this.onDragOut()
    const el = childNode.el
    this.containerEl.appendChild(el)
    this.updateChildStyle(childNode)
    this.onChildAppended(childNode)
  }

  /**
   * 更新子节点次序
   **/
  updateChildList (childList) {
    for (const childNode of childList) {
      this.containerEl.appendChild(childNode.el)
      this.updateChildStyle(childNode)
    }
  }

  isEditMode () {
    return this.view != null
  }

  isDroppable () {
    return true
  }

  // 拖拽上浮
  onDragOver () {
    const existedNode = this.el.querySelector(':scope > .drop-shadow')

    if (existedNode == null) {
      const shadowNode = document.createElement('div')
      shadowNode.classList.add('drop-shadow')
      shadowNode.innerHTML = '可以放入容器内'

      // const tag = document.createElement('div')
      // tag.classList.add('drop-tag')

      // tag.innerHTML = this.props.__view.config.title

      // shadowNode.appendChild(tag)

      this.el.appendChild(shadowNode)

      if (!this.el.style.position) {
        this.el.style.position = 'relative'
      }
    }
  }

  // 拖拽离开
  onDragOut () {
    if (this.el.querySelector(':scope > .drop-shadow')) {
      this.el.removeChild(this.el.querySelector(':scope > .drop-shadow'))
    }
    if (this.el.style.position === 'relative') {
      this.el.style.position = ''
    }
  }

  // 删除子节点
  removeChild (node) {
    if (node.el.parentElement === this.containerEl) {
      this.containerEl.removeChild(node.el)
    }
    this.onChildRemoved(node)
  }

  /**
   * 计算并更新子节点样式
   * @param  {ElementWrapper} wrapper 封装类
   */
  updateChildStyle (view) {
    const style = Object.assign({}, this.getChildStyle(view))

    Object.assign(view.el.style, style)
  }

  getChildren () {
    return this.getChildElements().map(el => {
      return el.ridgeNode?.config?.id
    }).filter(e => e != null)
  }

  getChildElements () {
    return Array.from(this.containerEl.childNodes).filter(el => el.ridgeNode)
  }

  /**
   * 按属性联动方法
   * @param {*} props
   */
  update (props) {
    Object.assign(this.props, props)

    // 更新容器本身样式
    Object.assign(this.containerEl.style, this.getContainerStyle())

    this.containerEl.className = (this.props.classNames || []).join(' ')

    // 联动更新所有子节点
    if (this.forceUpdateChildren && this.props.children) {
      for (const childId of this.props.children) {
        const childNode = this.composite.getNode(childId)
        if (childNode) {
          childNode.forceUpdate()
        }
      }
    }
    this.updated()
  }

  getResetStyle () {
    return {
      position: '',
      top: '',
      left: '',
      transform: '',
      width: '',
      height: ''
    }
  }
}
