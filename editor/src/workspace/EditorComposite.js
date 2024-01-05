import { Composite } from 'ridge-runtime'
import EditorElement from './EditorElement.js'
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
  }

  updateStyle () {
    super.updateStyle()
    if (this.config.style) {
      const { width, height } = this.config.style

      this.el.style.width = width + 'px'
      this.el.style.height = height + 'px'
    }
  }

  /**
   * 更新页面引入的样式表
   */
  async importStyleFiles () {
    const oldStyles = document.querySelectorAll('style[page-id="' + this.config.id + '"]')
    for (const styleEl of oldStyles) {
      document.head.removeChild(styleEl)
    }

    const { cssFiles } = this.config
    const { appService } = this.context.services
    this.classNames = []
    for (const filePath of cssFiles || []) {
      const file = appService.getFileByPath(filePath)

      if (file) {
        if (!file.textContent) {
          file.textContent = await appService.getFileContent(file)
        }
        const styleEl = document.createElement('style')
        styleEl.setAttribute('page-id', this.config.id)
        document.head.appendChild(styleEl)
        styleEl.textContent = '\r\n' + file.textContent
        // 计算使用的样式
        const matches = file.textContent.match(/\/\*.+\*\/[^{]+{/g)
        for (const m of matches) {
          const label = m.match(/\/\*.+\*\//)[0].replace(/[/*]/g, '')
          const className = m.match(/\n[^{]+/g)[0].trim().substring(1)

          this.classNames.push({
            className,
            label
          })
        }
      }
    }
  }

  /**
   * Import JS Files
   */
  async importJSFiles () {
    const jsModules = []
    const oldScripts = document.querySelectorAll('script[page-id="' + this.config.id + '"]')
    for (const scriptEl of oldScripts) {
      document.head.removeChild(scriptEl)
    }
    const { jsFiles } = this.config
    for (const filePath of jsFiles || []) {
      const jsStoreModule = await this.importJSFile(filePath, true)
      if (jsStoreModule) {
        jsModules.push(jsStoreModule)
      }
    }
    return jsModules
  }

  async importJSFile (jsPath) {
    const { appService } = this.context.services
    const file = appService.getFileByPath(jsPath)
    if (file) {
      if (!file.textContent) {
        file.textContent = await appService.getFileContent(file)
      }
      const scriptEl = document.createElement('script')
      scriptEl.setAttribute('page-id', this.config.id)

      const jsGlobal = 'ridge-store-' + nanoid(10)
      scriptEl.textContent = file.textContent.replace('export default', 'window["' + jsGlobal + '"]=')

      try {
        document.head.append(scriptEl)
        return window[jsGlobal]
      } catch (e) {
        console.error('Store Script Error', e)
        return null
      }
    }
  }

  parseJsStoreModule (jsStoreModule) {
    const storeModule = {
      module: jsStoreModule,
      name: jsStoreModule.name ?? '未命名', // module name
      actions: [], // module actions
      states: [], // module global state includes computed, but only on runtime they are different
      scoped: [] // only for scoped binding (now only list)
    }
    this.storeModules.push(storeModule)

    if (jsStoreModule.state) {
      let initStateObject = {}
      if (typeof jsStoreModule.state === 'function') {
        initStateObject = jsStoreModule.state()
      } else if (typeof jsStoreModule.state === 'object') {
        initStateObject = jsStoreModule.state
      }
      for (const key of Object.keys(initStateObject)) {
        storeModule.states.push({
          name: key
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

    if (jsStoreModule.actions && typeof jsStoreModule.actions === 'object') {
      Object.keys(jsStoreModule.actions || {}).forEach(key => {
        storeModule.actions.push({
          name: key
        })
      })
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
