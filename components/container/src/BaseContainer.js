import './style.css'

/**
 * @abstract BaseContainer
 * 容器基础实现，包含通用配置及方法
 */
export default class BaseContainer {
  constructor (props) {
    this.props = props
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
    const containerDiv = document.createElement('div')
    this.containerEl = containerDiv

    this.containerEl.className = (this.props.classNames || []).join(' ')

    el.appendChild(containerDiv)

    // ？？ 编辑器之下，有当前view对象句柄可以进行其他相关操作， 运行态下没有
    this.view = this.props.__view
    this.composite = this.props.__composite
    this.isRuntime = this.props.__isRuntime
    Object.assign(this.containerEl.style, {
      width: '100%',
      height: '100%'
    }, this.getContainerStyle())
    this.children = []
    if (this.props.children) {
      for (const childId of this.props.children) {
        const childNode = this.composite.getNode(childId)
        if (childNode) {
          this.children.push(childNode)
          const childDiv = document.createElement('div')
          childDiv.classList.add('base-children')
          this.containerEl.appendChild(childDiv)
          await childNode.mount(childDiv)
          this.updateChildStyle(childNode)
        }
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
  appendChild (view) {
    this.onDragOut()
    const el = view.el
    this.containerEl.appendChild(el)
    this.updateChildStyle(view)
    this.onChildAppended(view)
    return this.getChildren()
  }

  /**
   * 更新子节点次序
   **/
  updateChildList (orders) {
    for (const childId of this.props.children) {
      const childNode = this.composite.getNode(childId)
      if (childNode) {
        this.containerEl.removeChild(childNode.el)
      }
    }

    for (let i = 0; i < orders.length; i++) {
      const childNode = this.composite.getNode(orders[i])
      this.containerEl.appendChild(childNode.el)
      this.updateChildStyle(childNode)
    }
    return orders
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

      const tag = document.createElement('div')
      tag.classList.add('drop-tag')

      tag.innerHTML = this.props.__view.config.title

      shadowNode.appendChild(tag)

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
  removeChild (view) {
    // 原地阴影
    if (view.el.parentElement === this.containerEl) {
      this.containerEl.removeChild(view.el)
    }
    this.onChildRemoved(view)
    return this.getChildren()
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
    if (this.props.children) {
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
