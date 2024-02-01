import { Element } from 'ridge-runtime'
import _ from 'lodash'
import { nanoid } from '../utils/string'
import { getBlobUrl } from './editorUtils.js'

import context from '../service/RidgeEditorContext.js'

export default class EditorElement extends Element {
  getProperties () {
    return Object.assign({}, this.config.props, this.properties, {
      children: this.children
    }, {
      __isEdit: true
    })
  }

  mounted () {
    if (this.config.props.children != null) {
      this.el.classList.add('ridge-container')
    }

    this.el.classList.add('ridge-editor-element')

    this.setLocked(this.config.locked)
  }

  appendChild (node, { x, y } = {}, rect) {
    let order = -1
    if (this.hasMethod('checkNodeOrder') && rect) {
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

  getBlobUrl (url) {
    return getBlobUrl(url, context)
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
    this.updateSystemProperties()
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

  /**
   * 编辑期间复制
   **/
  clone () {
    const clonedConfig = _.cloneDeep(this.config)
    clonedConfig.id = nanoid(5)
    const cloned = new EditorElement({
      composite: this.composite,
      componentDefinition: this.componentDefinition,
      config: clonedConfig
    })

    if (this.children) {
      cloned.children = []
      for (const childNode of this.children) {
        const childNodeCloned = childNode.clone()
        childNodeCloned.parent = cloned
        cloned.children.push(childNodeCloned)
        this.composite.nodes[childNodeCloned.getId()] = childNodeCloned
      }
    }

    this.composite.nodes[cloned.getId()] = cloned
    return cloned
  }

  exportJSON () {
    if (this.children) {
      this.config.props.children = this.children.map(childNode => childNode.getId())
    }
    return JSON.parse(JSON.stringify(this.config))
  }
}
