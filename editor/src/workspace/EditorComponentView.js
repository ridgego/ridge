import { ComponentView } from 'ridge-runtime'
class EditorComponentView extends ComponentView {
  constructor (config) {
    super(config)
    // 系统内置属性
    this.systemProperties = {
      __context: this.context,
      __componentView: this
    }
  }

  getProperties () {
    return Object.assign({},
      this.systemProperties, // 系统属性
      this.properties // 动态计算属性
    )
  }

  updateStyleConfig (style) {
    Object.assign(this.config.style, style)
  }

  updateConfig (config) {
    Object.assign(this.config, config)
    this.forceUpdate()
  }

  exportJSON () {
    return JSON.parse(JSON.stringify(this.config))
  }
}

export default EditorComponentView