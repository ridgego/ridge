import ValtioStore from './ValtioStore'
import ComponentView from './ComponentView'
import ElementView from './ElementView'
import { nanoid } from '../utils/string'
import Debug from 'debug'
const debug = Debug('ridge:manager')

/**
 * A Composite View Component which contains many other ComponentView/CompositeView
 * Could be:
 * A Web Page
 * A Frame in Web Page
 * A Composite UI Component in Frame Or Page
 * Composite View is actully a front UI component like React/Vue, And it has properties/states, and can emit outlet events
 * */
class CompositeView extends ElementView {
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
    this.initialize()
  }

  getComponentViews () {
    return this.componentViews
  }

  getComponentView (id) {
    return this.componentViews[id]
  }

  /**
   * 根据页面配置读取页面控制对象结构
   * @param {Element} el DOM 根元素
   */
  initialize () {
    debug('Ridge Composite initialize:', this.config)
    this.componentViews = {}
    // 根节点的排序号
    let rootIndex = 0
    for (let i = 0; i < this.config.elements.length; i++) {
      const view = this.createComponentView(this.config.elements[i])
      if (view.isRoot()) {
        view.setRootIndex(rootIndex)
        rootIndex++
      }
      this.componentViews[view.getId()] = view
    }
  }

  createComponentView (config) {
    return new ComponentView({
      compositeView: this,
      config
    })
  }

  /**
   * Load & Mount on HTMLElement
   * @param {Element} el root element
   */
  async loadAndMount (el) {
    if (el) {
      this.el = el
    }
    this.updateStyle()
    await this.importStyleFiles()
    await this.importJSFiles()
    await this.loadStore()

    const promises = []
    for (const view of Object.values(this.componentViews).filter(e => e.isRoot())) {
      const div = document.createElement('div')
      el.appendChild(div)
      promises.push(await view.loadAndMount(div))
    }
    this.onPageMounted && this.onPageMounted()
    await Promise.allSettled(promises)
    this.onPageLoaded && this.onPageLoaded()
  }

  unmount () {
    for (const view of Object.values(this.componentViews).filter(e => e.isRoot())) {
      view.unmount()
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

export default CompositeView
