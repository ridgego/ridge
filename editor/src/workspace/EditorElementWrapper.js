import { ElementWrapper } from 'ridge-runtime'

export default class EditorElementWrapper extends ElementWrapper {
  constructor ({
    config,
    pageManager
  }) {
    super({
      config,
      pageManager
    })
    this.isEditor = true
  }

  /**
   * 修改组件配置的样式信息
   * @param {*} style
   */
  setStyle (style) {
    Object.assign(this.config.style, style)

    if (style.width) {
      this.el.style.width = style.width + 'px'
    }
    if (style.height) {
      this.el.style.height = style.height + 'px'
    }
    if (style.position === 'absolute') {
      if (this.el.style.position !== 'absolute') {
        this.el.style.position = 'absolute'
        this.el.style.left = 0
        this.el.style.top = 0
      }

      this.el.style.transform = `translate(${style.x}px, ${style.y}px)`
    } else {
      this.el.style.transform = ''
      this.el.style.position = ''
    }
  }

  /**
   * 组件配置信息发生改变，通过编辑器配置面板传入
   * @param {*} values
   * @param {*} field
   */
  setPropsConfig (values, field) {
    for (const keyPath of Object.keys(field)) {
      const [type, key] = keyPath.split('.')

      if (type === 'props') {
        Object.assign(this.config.props, {
          [key]: field[keyPath]
        })
      }
      if (type === 'style') {
        this.setStyle({
          [key]: field[keyPath]
        })
      }
      if (type === 'propsEx') {
        Object.assign(this.config.propEx, {
          [key]: field[keyPath]
        })
      }
      if (type === 'styleEx') {
        Object.assign(this.config.styleEx, {
          [key]: field[keyPath]
        })
      }
    }
    this.forceUpdateStyle()
    this.forceUpdate()
  }

  setEventsConfig (values, update) {
    Object.assign(this.config.events, values.event)
  }

  /**
   * 获取封装层样式，包括  x/y/width/height/visible/rotate
   * @returns
   */
  getStyle () {
    return this.config.style
    // const style = {
    // }
    // if (this.el.style.transform) {
    //   const matched = this.el.style.transform.match(/[0-9.]+/g)
    //   style.x = parseInt(matched[0])
    //   style.y = parseInt(matched[1])
    //   style.position = 'absolute'
    // } else {
    //   style.x = 0
    //   style.y = 0
    // }
    // style.width = parseInt(this.el.style.width)
    // style.height = parseInt(this.el.style.height)

    // Object.assign(this.instanceStyle, style)
    // return this.instanceStyle
  }

  toJSON () {
    return this.config
  }
}
