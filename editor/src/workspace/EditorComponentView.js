import { ComponentView } from 'ridge-runtime'
import _ from 'lodash'

class EditorComponentView extends ComponentView {
  constructor (config) {
    super(config)
    // 系统内置属性
    this.systemProperties = {
      __context: this.context,
      __view: this
    }
    if (config.definition) {
      this.preloaded = true
      this.componentDefinition = config.definition
    }
  }

  mounted () {
    this.el.classList.add('ridge-element-edit')
  }

  setIndex (index) {
    this.i = index
  }

  getProperties () {
    return Object.assign({},
      this.systemProperties, // 系统属性
      this.properties, // 动态计算属性
      this.slotProperties // 子节点 + slot节点
    )
  }

  /**
   * Set default value props
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