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
    Object.assign(this.containerEl.style, {
      width: '100%',
      height: '100%'
    }, this.getContainerStyle())

    if (this.props.children) {
      for (const childrenView of this.props.children) {
        const childDiv = document.createElement('div')
        childDiv.classList.add('children')
        this.containerEl.appendChild(childDiv)
        await childrenView.loadAndMount(childDiv)
        this.updateChildStyle(childrenView)
      }
    }
    await this.mounted()
  }

  /**
   * 增加子节点
   */
  appendChild (view) {
    this.onDragOut()
    const el = view.el
    this.containerEl.appendChild(el)
    this.updateChildStyle(view)
    return true
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
    return true
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
    return {
      children: this.getChildElements().map(el => {
        return el.view?.config?.id
      }).filter(e => e != null)
    }
  }

  getChildElements () {
    return Array.from(this.containerEl.childNodes).filter(el => el.classList.contains('ridge-element'))
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

    if (this.props.children) {
      for (const childWrapper of this.props.children) {
        childWrapper.forceUpdate()
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
