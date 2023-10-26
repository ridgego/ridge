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
      this.componentDefinition = config.definition
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

  /**
   * 枚举每个子节点
   * @param {*} cb
   */
  forEachChildren (cb) {
    // 递归处理子节点树
    if (this.componentDefinition == null) {
      return
    }
    const childProps = this.componentDefinition.props.filter(p => p.type === 'children')
    if (childProps.length) {
      for (const childProp of childProps) {
        if (this.config.props[childProp.name] && this.config.props[childProp.name].length) {
          for (let i = 0; i < this.config.props[childProp.name].length; i++) {
            if (this.config.props[childProp.name][i]) {
              cb(this.pageManager.pageElements[this.config.props[childProp.name][i]], 'children', childProp.name, i)
            }
          }
        }
      }
    }

    // 递归处理插槽节点
    const slotProps = this.componentDefinition.props.filter(p => p.type === 'slot')
    if (slotProps.length) {
      for (const childProp of slotProps) {
        if (this.config.props[childProp.name]) {
          cb(this.pageManager.pageElements[this.config.props[childProp.name]], 'slot', childProp.name)
        }
      }
    }
  }

  exportJSON () {
    return JSON.parse(JSON.stringify(this.config))
  }
}

export default EditorComponentView