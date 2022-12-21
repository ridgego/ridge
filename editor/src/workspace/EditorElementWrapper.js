import { ElementWrapper } from 'ridge-runtime'

export const STATUS_DROPPABLE = 'droppable'
export const STATUS_LOADING = 'loading'

export const ATTR_DROPPABLE = 'droppable'

export default class EditorElementWrapper extends ElementWrapper {
  constructor ({
    config,
    pageManager
  }) {
    super({
      config,
      pageManager
    })
    this.isContainer = false
    Object.assign(this.properties, {
      __editor: true
    })
  }

  /**
   * 对于布局性质的配置进行读取配置
   */
  initPropsAndEvents () {
    super.initPropsAndEvents()
    this.slotProps = []
    for (const prop of this.componentDefinition.props || []) {
      if (prop.type === 'children') {
        this.isContainer = true
        if (this.el) {
          this.el.classList.add('container')
        }
      }
      if (prop.type === 'slot') {
        this.isContainer = true
        this.slotProps.push(prop)
      }
    }
  }

  mount (el) {
    super.mount(el)
    if (this.isContainer) {
      el.classList.add('container')
    }
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
    if (this.config.style.position === 'absolute') {
      if (this.el.style.position !== 'absolute') {
        this.el.style.position = 'absolute'
        this.el.style.left = 0
        this.el.style.top = 0
      }
      this.el.style.transform = `translate(${this.config.style.x}px, ${this.config.style.y}px)`
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
  }

  getChildrenIds () {
    return this.config.props.children || []
  }

  /**
   * 计算获取插槽子元素
   * @returns Array 元素列表
   */
  getSlotChildren () {
    const slotChildren = []
    if (this.slotProps) {
      for (const prop of this.slotProps) {
        if (this.config.props[prop.name]) {
          slotChildren.push({
            prop,
            element: this.pageManager.getElement(this.config.props[prop.name])
          })
        }
      }
    }
    return slotChildren
  }

  toJSON () {
    return this.config
  }
}
