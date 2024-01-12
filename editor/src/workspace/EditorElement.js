import { Element } from 'ridge-runtime'
import _ from 'lodash'

import context from '../service/RidgeEditorContext.js'

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

  appendChild (node, { x, y }, rect) {
    let order = -1
    if (this.hasMethod('checkNodeOrder')) {
      order = this.invoke('checkNodeOrder', [rect])
    }
    if (order > -1) {
      this.children.splice(order, 0, node)
    } else {
      this.children.push(node)
    }
    node.parent = this
    this.invoke('appendChild', [node, { x, y }, order])
  }

  removeChild (node) {
    this.children = this.children.filter(n => n !== node)
    node.parent = null

    // 设置到顶级的位置
    const { workspaceControl } = context

    const rectConfig = workspaceControl.getElementRectConfig(node.el)

    this.invoke('removeChild', [node])

    node.setStyleConfig(rectConfig)
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

      // 设置store标志
      if (this.componentDefinition.type === 'store') {
        this.config.store = true
      }
    }
  }

  setVisible (visible) {
    this.config.visible = visible
    this.updateStyle()
  }

  setLocked (locked) {
    if (locked) {
      this.el.classList.add('ridge-is-locked')
    } else {
      this.el.classList.remove('ridge-is-locked')
    }
    this.config.locked = locked
  }

  // 更新
  updateStyleConfig (style) {
    console.log('updateStyleConfig', style)

    let updated = null
    if (this.parent) {
      updated = this.parent.invoke('updateChildStyleConfig', [style])
    }
    if (updated) {
      Object.assign(this.config.style, updated)
    } else {
      Object.assign(this.config.style, style)
    }

    this.style = this.config.style
    this.updateStyle()
  }

  setStyleConfig (style) {
    this.config.style = style
    this.style = this.config.style
    this.updateStyle()
  }

  updateChildConfig (childNodes) {
    this.config.props.children = childNodes.map(node => node.getId())
    this.properties.children = childNodes
    this.updateProps()
  }

  updateConfig (config, updateOnly) {
    console.log('updateConfig', config)
    Object.assign(this.config, config)

    // 更新配置属性到运行
    Object.assign(this.properties, config.props)
    this.style = config.style

    if (updateOnly !== true) {
      if (this.el) {
        if (this.config.locked === true) {
          this.el.classList.add('ridge-is-locked')
        } else {
          this.el.classList.remove('ridge-is-locked')
        }
      }
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
