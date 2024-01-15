import ValtioStore from '../store/ValtioStore'
import Element from './Element'
import BaseNode from './BaseNode'
import { nanoid } from '../utils/string'
import Debug from 'debug'
const debug = Debug('ridge:manager')

/**
 * 包含多个元素的组合型元素
 **/
class Composite extends BaseNode {
  constructor ({
    el,
    appBaseUrl,
    config,
    properties,
    context
  }) {
    super()
    this.config = config
    this.context = context
    this.appBaseUrl = appBaseUrl
    this.el = el
    this.properties = properties
    this.initialize()
  }

  // 预加载所有组件
  async load () {
    const promises = []
    await Promise.allSettled(promises)
    for (const node of Object.values(this.nodes)) {
      promises.push(await node.load())
    }
    await Promise.allSettled(promises)
  }

  getNodes (filter) {
    const nodes = Object.values(this.nodes)
    if (filter) {
      return nodes.filter(filter)
    } else {
      return nodes
    }
  }

  getRootNodes () {
    return Object.values(this.nodes).filter(e => e.isRoot())
  }

  getNode (id) {
    return this.nodes[id]
  }

  /**
   * 根据页面配置读取页面控制对象结构
   * @param {Element} el DOM 根元素
   */
  initialize () {
    debug('Ridge Composite initialize:', this.config)
    this.nodes = {}
    for (let i = 0; i < this.config.elements.length; i++) {
      const node = this.createElement(this.config.elements[i])
      this.nodes[node.getId()] = node
    }
    this.initChildren()
    this.events = {}
  }

  initChildren () {
    if (!this.config.children) {
      this.children = Object.values(this.nodes).filter(n => n.config.parent == null)
    } else {
      this.children = this.config.children.map(id => this.nodes[id])
    }
    for (const childNode of this.children) {
      childNode.parent = this
      childNode.initChildren()
    }
  }

  createElement (config) {
    return new Element({
      composite: this,
      config
    })
  }

  // 挂载
  async mount (el) {
    if (el) {
      this.el = el
      this.classList = new Set()
      for (const className of this.el.classList) {
        this.classList.add(className)
      }
    }
    // 挂载前事件
    this.emit('postMount')
    this.updateStyle()
    this.onPageMounted && this.onPageMounted()

    this.jsModules = await this.importJSFiles()
    await this.importStyleFiles()
    await this.loadStore()
    const promises = []
    for (const childNode of this.children) {
      const div = document.createElement('div')
      this.el.appendChild(div)
      promises.push(await childNode.mount(div))
    }

    await Promise.allSettled(promises)
    this.onPageLoaded && this.onPageLoaded()

    this.initializeEvents()
    this.emit('loaded')
  }

  // 卸载
  unmount () {
    for (const childNode of this.children) {
      childNode.unmount()
    }
  }

  // 更新自身样式
  updateStyle () {
    if (this.config.style && this.el) {
      const { background, classNames } = this.config.style
      background && Object.assign(this.el.style, {
        background
      })
      classNames && classNames.forEach(cn => {
        this.el.classList.add(cn)
      })

      const allClassList = [...classNames, ...this.classList]
      for (const className of this.el.classList) {
        if (allClassList.indexOf(className) === -1) {
          this.el.classList.remove(className)
        }
      }
      this.el.classList.add('ridge-composite')
      // this.el.style.position = 'relative'
    }
  }

  // 更新子节点位置样式
  updateChildStyle (childNode) {
    if (childNode.el) {
      if (childNode.config.full) {
        childNode.el.classList.add('ridge-is-full')
        childNode.el.style.transform = 'none'
        childNode.el.style.width = ''
        childNode.el.style.height = ''
      } else {
        const style = childNode.config.style
        childNode.el.classList.remove('ridge-is-full')
        childNode.el.style.position = 'absolute'
        childNode.el.style.left = 0
        childNode.el.style.top = 0
        childNode.el.style.transform = `translate(${style.x}px, ${style.y}px)`
        childNode.el.style.width = style.width ? (style.width + 'px') : ''
        childNode.el.style.height = style.height ? (style.height + 'px') : ''
      }
    }
  }

  getScopedData () {
    return []
  }

  // 导入组合样式
  async importStyleFiles () {
    const { cssFiles } = this.config

    for (const cssFile of cssFiles ?? []) {
      await this.context.loadScript(this.appBaseUrl + '/' + cssFile)
    }
  }

  // 导入页面脚本文件
  async importJSFiles () {
    const { jsFiles } = this.config

    const jsModules = []

    for (const filePath of jsFiles ?? []) {
      const JsModule = await this.loadModule(this.appBaseUrl + '/' + filePath)
      if (JsModule) {
        jsModules.push(JsModule)
      }
    }
    return jsModules
  }

  async loadModule (jsPath) {
    const resolveKey = 'resolve-' + nanoid(5)
    const scriptDiv = document.createElement('script')
    scriptDiv.setAttribute('type', 'module')
    scriptDiv.setAttribute('async', true)
    document.head.append(scriptDiv)
    scriptDiv.textContent = `import * as Module from '${jsPath}'; window['${resolveKey}'](Module);`
    return await new Promise((resolve, reject) => {
      window[resolveKey] = (Module) => {
        delete window[resolveKey]
        if (Module && Module.default) {
          resolve(Module.default)
        } else {
          resolve(null)
        }
      }
    })
  }

  initializeEvents () {
  }

  on (name, callback) {
    this.events[name] = callback
  }

  emit (name, ...payload) {
    if (this.events[name]) {
      this.events[name](...payload)
    }
  }

  /**
   * Load Composite Store
   * */
  async loadStore () {
    this.store = new ValtioStore(this)
    this.store.load(this.jsModules)

    // Store型节点加载store
    const storeNodes = this.getNodes().filter(node => node.config.store)

    for (const storeNode of storeNodes) {
      await storeNode.load()
      this.store.load([Object.assign(storeNode.componentDefinition.component, {
        name: storeNode.config.id
      })])
    }
  }
}

export default Composite
