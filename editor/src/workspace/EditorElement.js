import { Element } from 'ridge-runtime'
import _ from 'lodash'

class EditorElement extends Element {
  getProperties () {
    return Object.assign({}, this.config.props, {
      children: this.children
    }, {
      __isEdit: true
    })
  }

  mounted () {
    if (this.config.props.children != null) {
      this.el.classList.add('ridge-container')
    }
  }

  appendChild (node, { x, y }) {
    this.children.push(node)
    node.parent = this
    this.invoke('appendChild', [node, { x, y }])
  }

  removeChild (node) {
    this.children = this.children.filter(n => n !== node)
    node.parent = null

    this.invoke('removeChild', [node])
  }

  getPositionInViewPort () {
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
        if (prop.name === 'children') {
          this.config.props.children = []
          this.children = []
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

  updateChildConfig (childNodes) {
    this.config.props.children = childNodes.map(node => node.getId())
    this.properties.children = childNodes
    this.updateProps()
  }

  updateConfig (config, updateOnly) {
    Object.assign(this.config, config)
    // _.merge(this.config, config)

    // 更新配置属性到运行
    Object.assign(this.properties, config.props)
    this.style = config.style

    if (updateOnly !== true) {
      this.updateStyle()
      this.updateProps()
    }
  }

  childRemoved (node) {
    this.invoke('removeChild', [node])
  }

  updateChildList (orders) {
    this.children = orders.map(id => this.composite.getNode(id)).filter(t => t)
    this.invoke('updateChildList', [this.children])
    // this.updateChildConfig(childNodes)
  }

  selected () {
    this.invoke('selected')

    if (this.parent && this.parent.invoke) {
      this.parent.invoke('childSelected', [this])
    }
  }

  exportJSON () {
    if (this.children) {
      this.config.props.children = this.children.map(childNode => childNode.getId())
    }
    return JSON.parse(JSON.stringify(this.config))
  }
}

export default EditorElement
