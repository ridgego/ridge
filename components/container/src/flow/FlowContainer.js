import { border } from 'ridge-prop-utils'

export default class FlowContainer {
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
      }
    }
  }

  updateStyle (style) {
    console.log('update style', style)
  }

  appendChild (wrapper) {
    const el = wrapper.el
    if (el.parentElement !== this.containerEl) {
      this.containerEl.appendChild(el)

      const style = {
        position: 'static'
      }
      if (wrapper.config.style.maxWidth) {
        style.maxWidth = wrapper.config.style.maxWidth
      }
      if (wrapper.config.style.maxWidth) {
        style.maxWidth = wrapper.config.style.maxWidth
      }
      style.display = wrapper.config.style.display

      Object.assign(wrapper.config.style, style)

      wrapper.updateStyle()
    }
  }

  updateChild (wrapper) {
    wrapper.updateStyle()
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
