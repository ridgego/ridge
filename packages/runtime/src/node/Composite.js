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
    baseUrl,
    context
  }) {
    super()
    this.config = config
    this.context = context
    this.el = el
    this.jsModules = []
    this.nodes = {}
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
    // 根节点的排序号
    let rootIndex = 0
    for (let i = 0; i < this.config.elements.length; i++) {
      const node = this.createElement(this.config.elements[i])
      if (node.isRoot()) {
        node.setRootIndex(rootIndex)
        rootIndex++
      }
      this.nodes[node.getId()] = node
    }
  }

  createElement (config) {
    return new Element({
      composite: this,
      config
    })
  }

  /**
   * Load & Mount on HTMLElement
   * @param {Element} el root element
   */
  async mount (el) {
    if (el) {
      this.el = el
    }
    this.updateStyle()
    this.onPageMounted && this.onPageMounted()

    await this.importStyleFiles()
    await this.importJSFiles()
    await this.loadStore()

    const promises = []
    for (const node of Object.values(this.nodes).filter(e => e.isRoot())) {
      const div = document.createElement('div')
      this.el.appendChild(div)
      promises.push(await node.mount(div))
    }

    await Promise.allSettled(promises)
    this.onPageLoaded && this.onPageLoaded()
  }

  unmount () {
    for (const node of Object.values(this.nodes).filter(e => e.isRoot())) {
      node.unmount()
    }
  }

  /**
   * Update element style which the composite mounted on
   * */
  updateStyle () {
    if (this.config.style) {
      const { background, classNames } = this.config.style
      background && Object.assign(this.el.style, {
        background
      })
      classNames && classNames.forEach(cn => {
        this.el.classList.add(cn)
      })
      this.el.style.position = 'relative'
    }
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

    for (const filePath of jsFiles ?? []) {
      const JsModule = await this.loadModule(this.context.baseUrl + '/' + this.app + '/' + filePath)
      if (JsModule) {
        this.jsModules.push(JsModule)
      }
    }
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
