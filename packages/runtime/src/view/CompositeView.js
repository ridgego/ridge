import ValtioStore from './ValtioStore'
import ComponentView from './ComponentView'
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
class CompositeView {
  constructor ({
    config,
    app,
    context
  }) {
    this.id = config.id
    this.config = config
    this.context = context

    this.initialize()
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
        pageManager: this,
        mode: this.mode,
        config: this.config.elements[i],
        i
      })
      this.children[view.id] = view
    }
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

    await this.updateStore()

    const promises = []
    for (const wrapper of Object.values(this.pageElements).filter(e => e.isRoot())) {
      const div = document.createElement('div')
      el.appendChild(div)
      promises.push(await wrapper.loadAndMount(div))
    }
    this.onPageMounted && this.onPageMounted()
    await Promise.allSettled(promises)
    this.onPageLoaded && this.onPageLoaded()
  }

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
   * 更新页面引入的样式表
   */
  async importStyleFiles () {
    const { cssFiles } = this.config

    for (const cssFile of cssFiles ?? []) {
      await this.context.loadScript(this.context.baseUrl + '/' + this.app + '/' + cssFile)
    }
  }

  async importJSFiles () {
    const { jsFiles } = this.config

    for (const filePath of jsFiles ?? []) {
      await this.context.loadScript(this.context.baseUrl + '/' + this.app + '/' + filePath)
    }
  }

  async loadStore () {
    this.store = new ValtioStore()
  }
}

export default CompositeView
