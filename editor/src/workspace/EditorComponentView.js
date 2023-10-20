import { ComponentView } from 'ridge-runtime'
import _ from 'lodash'

class EditorComponentView extends ComponentView {
  constructor (config) {
    super(config)
    // 系统内置属性
    this.systemProperties = {
      __context: this.context,
      __componentView: this
    }
  }

  setIndex (index) {
    this.i = index
  }

  getProperties () {
    return Object.assign({},
      this.systemProperties, // 系统属性
      this.properties // 动态计算属性
    )
  }

  updateStyleConfig (style) {
    _.merge(this.config.style, style)
    // Object.assign(this.config.style, style)
    this.updateStyle()
  }

  updateConfig (config) {
    _.merge(this.config, config)

    // 更新配置属性到运行
    Object.assign(this.properties, config.props)
    this.updateStyle()
    this.updateProps()
  }

  exportJSON () {
    return JSON.parse(JSON.stringify(this.config))
  }
}

export default EditorComponentView