import { border } from 'ridge-prop-utils'

/**
 * 流式容器，HTML默认的布局方式
 */
export default class AbsoluteContainer {
  constructor (props) {
    this.props = props
  }

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
    containerDiv.classList.add('flow-container')
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

    if (wrapper.config.style.maxWidth) {
      style.maxWidth = wrapper.config.style.maxWidth + 'px'
    }

    if (wrapper.config.style.center) {
      style.margin = '0 auto'
    } else {
      style.margin = ''
    }

    // block && inline-block
    style.display = wrapper.config.style.display

    Object.assign(wrapper.el.style, style)
  }

  appendChild (wrapper) {
    const el = wrapper.el
    if (el.parentElement !== this.containerEl) {
      this.containerEl.appendChild(el)

      this.updateChildStyle(wrapper)
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
