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