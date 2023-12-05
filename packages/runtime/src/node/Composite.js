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
    config,
    context
  }) {
    super()
    this.config = config
    this.context = context
    this.el = el
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

  getNodes () {
    return Object.values(this.nodes)
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
    }
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
      this.el.classList.add('ridge-composite')
      // this.el.style.position = 'relative'
    }
  }

  // 更新子节点位置样式
  updateChildStyle (childNode) {
    const style = childNode.config.style
    if (childNode.el) {
      if (style.full) {
        childNode.el.classList.add('ridge-is-full')
        childNode.el.classList.remove('ridge-is-absolute')
      } else {
        childNode.el.style.transform = `translate(${style.x}px, ${style.y}px)`
        childNode.el.style.width = style.width ? (style.width + 'px') : ''
        childNode.el.style.height = style.height ? (style.height + 'px') : ''
      }
    }
  }

  getScopedData () {
    return []
  }
  /**
   * Import/Update Composite Styles
   */
  async importStyleFiles () {
    const { cssFiles } = this.config

    for (const cssFile of cssFiles ?? []) {
      await this.context.loadScript(this.context.baseUrl + '/' + this.app + '/' + cssFile)
    }
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

  /**
   * Import JS Files
   */
  async importJSFiles () {
    const { jsFiles } = this.config

    const jsModules = []

    for (const filePath of jsFiles ?? []) {
      const JsModule = await this.loadModule(this.context.baseUrl + '/' + this.app + '/' + filePath)
      if (JsModule) {
        jsModules.push(JsModule)
      }
    }
    return jsModules
  }

  /**
   * Load Composite Store
   * */
  async loadStore () {
    this.store = new ValtioStore()
    this.store.load(this.jsModules)
  }
}

export default Composite
