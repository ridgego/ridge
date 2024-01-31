import { ValtioStore, Element } from 'ridge-runtime'
import EditorComposite from './EditorComposite.js'
import EditorElement from './EditorElement.js'
/**
 * Composite Preview on Editor
 **/
class PreviewComposite extends EditorComposite {
  createElement (config, i) {
    const element = new Element({
      composite: this,
      compositeView: this,
      config,
      i
    })
    console.log('EditorE', EditorElement.prototype.getBlobUrl)

    element.getBlobUrl = EditorElement.prototype.getBlobUrl

    return element
  }

  updateStyle () {
    super.updateStyle()
    this.el.classList.remove('is-edit')
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
