import { Composite } from 'ridge-runtime'
import EditorElement from './EditorElement.js'
import { importStyleFiles, importJSFiles } from './editorUtils.js'
import { nanoid } from '../utils/string'
import _ from 'lodash'
/**
 * Views Mount on Editor
 **/
class EditorComposite extends Composite {
  createElement (config) {
    return new EditorElement({
      composite: this,
      config
    })
  }

  getClassNames () {
    return this.classNames || []
  }

  updatePageConfig (config) {
    Object.assign(this.config, config)

    this.updateStyle()
    this.refresh()
  }

  async refresh () {
    await this.importStyleFiles()
    await this.importJSFiles()

    this.loadStore()
  }

  /**
   * Load Composite Store
   * */
  async loadStore () {
    this.storeModules = []
    for (const jsModules of this.jsModules) {
      if (jsModules && jsModules.name) {
        this.parseJsStoreModule(jsModules)
      }
    }
    // Store型节点加载store
    const storeNodes = this.getNodes(node => node.componentDefinition && node.componentDefinition.type === 'store')

    for (const storeNode of storeNodes) {
      await storeNode.load()
      // 特殊处理：编辑时更新显示的标题
      if (storeNode.renderer) {
        storeNode.renderer.update({
          title: storeNode.config.title
        })
      }
      this.parseJsStoreModule(Object.assign(storeNode.componentDefinition.component, {
        name: storeNode.config.id,
        label: storeNode.config.title
      }))
    }
  }

  updateStyle () {
    super.updateStyle()
    if (this.config.style) {
      const { width, height } = this.config.style

      this.el.style.width = width + 'px'
      this.el.style.height = height + 'px'

      this.el.classList.add('is-edit')
      this.el.classList.add('viewport-container')
    }
  }

  async importStyleFiles () {
    this.classNames = await importStyleFiles(this.config.cssFiles, this.context)
  }

  async importJSFiles () {
    return importJSFiles(this.config.jsFiles, this.context)
  }

  parseJsStoreModule (jsStoreModule) {
    try {
      const storeModule = {
        module: jsStoreModule,
        label: jsStoreModule.label ?? '未命名',
        name: jsStoreModule.name, // module name
        actions: [], // module actions
        states: [], // module global state includes computed, but only on runtime they are different
        computed: [],
        scoped: [] // only for scoped binding (now only list)
      }
      if (jsStoreModule.state) {
        let initStateObject = {}
        if (typeof jsStoreModule.state === 'function') {
          initStateObject = jsStoreModule.state({})
        } else if (typeof jsStoreModule.state === 'object') {
          initStateObject = jsStoreModule.state
        }
        for (const key of Object.keys(initStateObject)) {
          storeModule.states.push({
            name: key,
            value: initStateObject[key]
          })
        }
      }

      if (jsStoreModule.scoped) {
        for (const key of Object.keys(jsStoreModule.scoped)) {
          storeModule.scoped.push({
            name: key
          })
        }
      }

      if (jsStoreModule.computed) {
        for (const key of Object.keys(jsStoreModule.computed)) {
          storeModule.computed.push({
            name: key
          })
        }
      }

      if (jsStoreModule.actions && typeof jsStoreModule.actions === 'object') {
        Object.keys(jsStoreModule.actions || {}).forEach(key => {
          storeModule.actions.push({
            name: key
          })
        })
      }
      this.storeModules = this.storeModules.filter(m => m.name !== storeModule.name)
      this.storeModules.push(storeModule)
    } catch (e) {
      console.error('jsStoreModule Parse Error', jsStoreModule)
    }
  }

  getStoreModules () {
    return this.storeModules
  }

  /**
  * 从定义创建组件
  * @param {Object} defination
  * @returns
  */
  createNewElement (definition) {
    // 生成组件定义
    const elementConfig = {
      title: definition.title,
      path: definition.componentPath,
      id: nanoid(5),
      style: {
        position: 'absolute',
        visible: true,
        width: definition.width ?? 100,
        height: definition.height ?? 100
      },
      styleEx: {},
      props: {},
      propEx: {},
      events: {},
      visible: true,
      locked: false,
      full: false
    }

    const element = new EditorElement({
      config: elementConfig,
      componentDefinition: definition,
      composite: this
    })
    element.parent = this
    this.nodes[element.getId()] = element
    element.initPropsOnCreate()
    return element
  }

  unmount () {
    super.unmount()
    this.el.style.width = 0
    this.el.style.height = 0
    this.el.classList.remove('is-edit')
  }

  appendChild (node) {
    this.children.push(node)
    node.parent = this
    this.el.appendChild(node.el)
    node.updateStyle()
  }

  removeChild (node) {
    this.children = this.children.filter(n => n !== node)
    node.parent = null

    this.el.removeChild(node.el)
  }

  deleteNode (node) {
    if (node) {
      const parent = node.getParent()
      if (parent) {
        parent.removeChild(node)
      }
      for (const childNode of node.children ?? []) {
        this.deleteNode(childNode)
      }
      node.unmount()
      if (node.componentDefinition && node.componentDefinition.type === 'store') {
        this.storeModules = this.storeModules.filter(m => m.name !== node.config.id)
      }
      delete this.nodes[node.getId()]
    }
  }

  /**
   * 子节点排序
   **/
  updateChildList (orders) {
    for (const childNode of this.children) {
      this.el.removeChild(childNode.el)
    }

    this.children = []
    for (let i = 0; i < orders.length; i++) {
      const childNode = this.getNode(orders[i])
      if (childNode) {
        this.appendChild(childNode)
      }
    }
  }

  childAppended (childNode) {
    childNode.updateStyle()
  }

  onEditorElementCreated (node) {
    if (node.componentDefinition && node.componentDefinition.type === 'store') {
      this.parseJsStoreModule(Object.assign(node.componentDefinition.component, {
        name: node.config.id,
        label: node.config.title
      }))
    }
  }

  exportPageJSON () {
    this.config.elements = []
    for (const node of this.getNodes()) {
      this.config.elements.push(node.exportJSON())
    }
    this.config.children = this.children.map(n => n.getId())

    return _.cloneDeep(this.config)
  }
}

export default EditorComposite
