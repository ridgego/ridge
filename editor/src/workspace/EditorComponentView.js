import { ComponentView } from 'ridge-runtime'
import _ from 'lodash'

class EditorComponentView extends ComponentView {
  constructor (config) {
    super(config)
    if (config.definition) {
      this.preloaded = true
      this.componentDefinition = config.definition
    }
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

  getChildrenView () {
    if (this.config.props.children) {
      return this.config.props.children.map(id => this.compositeView.getComponentView(id)).filter(t => t)
    } else {
      return null
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

  onSelected () {
    this.invoke('onSelected')
    if (this.containerView) {
      this.containerView.invoke('onChildSelected', [this])
    }
  }

  exportJSON () {
    return JSON.parse(JSON.stringify(this.config))
  }
}

export default EditorComponentView