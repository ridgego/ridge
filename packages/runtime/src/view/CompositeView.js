import ValtioStore from './ValtioStore'
import ComponentView from './ComponentView'
import ElementView from './ElementView'
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
    config,
    app,
    context
  }) {
    super()
    this.config = config
    this.context = context

    this.initialize()
  }

  getComponentView (id) {
    return this.children[id]
  }

  /**
   * 根据页面配置读取页面控制对象结构
   * @param {Element} el DOM 根元素
   */
  initialize () {
    debug('Ridge Composite initialize:', this.config)
    this.children = {}
    for (let i = 0; i < this.config.elements.length; i++) {
      const view = new ComponentView({
        context: this.context,
        mode: this.mode,
        config: this.config.elements[i],
        i
      })
      this.children[view.id] = view
    }

    this.context.delegateMethods(this, ['getComponentView'])
  }

  /**
   * Load & Mount on HTMLElement
   * @param {Element} el root element
   */
  async loadAndMount (el) {
    this.el = el
    this.updateStyle()
    await this.importStyleFiles()
    await this.importJSFiles()

    await this.loadStore()

    const promises = []
    for (const wrapper of Object.values(this.children).filter(e => e.isRoot())) {
      const div = document.createElement('div')
      el.appendChild(div)
      promises.push(await wrapper.loadAndMount(div))
    }
    this.onPageMounted && this.onPageMounted()
    await Promise.allSettled(promises)
    this.onPageLoaded && this.onPageLoaded()
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

  /**
   * Import JS Files
   */
  async importJSFiles () {
    const { jsFiles } = this.config

    for (const filePath of jsFiles ?? []) {
      await this.context.loadScript(this.context.baseUrl + '/' + this.app + '/' + filePath)
    }
  }

  /**
   * Load Composite Store
   * */
  async loadStore () {
    this.store = new ValtioStore()

    await this.store.loadStoreModule(this.config.storeFiles)
    this.context.delegateMethods(this.store, ['subscribe', 'dispatchStateChange', 'doStoreAction'])
  }
}

export default CompositeView
