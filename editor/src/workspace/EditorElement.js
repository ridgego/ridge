import { Element } from 'ridge-runtime'
import _ from 'lodash'

class EditorElement extends Element {
  constructor (config) {
    super(config)
    if (config.definition) {
      this.preloaded = true
      this.componentDefinition = config.definition
    }
  }

  getProperties () {
    return Object.assign({}, this.config.props, {
      __composite: this.composite,
      __view: this,
      __isRuntime: false
    })
  }

  mounted () {
    this.el.classList.add('ridge-element-edit')
  }

  /**
   * 从自身父节点脱离
   **/
  detach () {
    const parent = this.getContainerView()
    if (parent) {
      parent.removeChild(this)
    }
  }

  /**
   * 移除子节点
   **/
  removeChild (child) {
    if (child && child.config.parent === this.config.id) {
      const result = this.invoke('removeChild', [child])
      delete child.config.parent

      this.updateChildConfig(result)
    }
  }

  appendChild (child, position = { x: 0, y: 0 }) {
    // 这里容器会提供 appendChild 方法，并提供放置位置
    const result = this.invoke('appendChild', [child, position.x, position.y])

    // 接受子节点
    if (result && result.indexOf(child.config.id) > -1) {
      child.config.parent = this.config.id

      this.updateChildConfig(result)
    }
  }

  /**
   * 初始化时配置默认值
   **/
  initPropsOnCreate () {
    if (this.componentDefinition) {
      for (const prop of this.componentDefinition.props || []) {
        if (!prop) continue
        if (prop.value != null) {
          this.config.props[prop.name] = prop.value
        }
      }
    }
  }

  updateStyleConfig (style) {
    _.merge(this.config.style, style)
    this.updateStyle()

    if (style.locked) {
      this.el.classList.add('is-locked')
    } else {
      this.el.classList.remove('is-locked')
    }
  }

  updateChildConfig (children) {
    this.config.props.children = children

    this.properties.children = children
    this.updateProps()
  }

  updateConfig (config) {
    _.merge(this.config, config)

    // 更新配置属性到运行
    Object.assign(this.properties, config.props)
    this.updateStyle()
    this.updateProps()
  }

  updateChildOrder (orders) {
    const children = this.invoke('updateOrder', [orders])
    this.updateChildConfig(children)
  }

  exportJSON () {
    return JSON.parse(JSON.stringify(this.config))
  }
}

export default EditorElement
