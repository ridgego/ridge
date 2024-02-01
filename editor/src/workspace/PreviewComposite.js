import { ValtioStore, Element, Composite } from 'ridge-runtime'
import { importStyleFiles, importJSFiles, getBlobUrl } from './editorUtils.js'
/**
 * Composite Preview on Editor
 **/
class PreviewComposite extends Composite {
  createElement (config, i) {
    const element = new Element({
      composite: this,
      compositeView: this,
      config,
      i
    })
    element.getBlobUrl = url => {
      return getBlobUrl(url, this.context)
    }

    return element
  }

  async importStyleFiles () {
    this.classNames = importStyleFiles(this.config.cssFiles, this.context)
  }

  async importJSFiles () {
    return importJSFiles(this.config.jsFiles, this.context)
  }

  updateViewPort (width, height) {
    this.el.style.width = width + 'px'
    this.el.style.height = height + 'px'
  }

  /**
   * Load Composite Store
   * */
  async loadStore () {
    // 加载页面引入的storejs
    this.store = new ValtioStore(this)
    this.store.load(this.jsModules, this.properties)

    // Store型节点加载store
    const storeNodes = this.getNodes().filter(node => node.config.store)

    for (const storeNode of storeNodes) {
      await storeNode.load()
      this.store.load([Object.assign(storeNode.componentDefinition.component, {
        name: storeNode.config.id
      })], storeNode.getProperties())
    }
  }

  unmount () {
    super.unmount()
    // this.context.unDelegateMethods(this.store, ['subscribe', 'dispatchStateChange', 'doStoreAction', 'getStoreValue'])
    this.el.style.width = 0
    this.el.style.height = 0
  }
}

export default PreviewComposite
