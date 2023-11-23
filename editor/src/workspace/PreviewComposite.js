import { ValtioStore, Element } from 'ridge-runtime'
import EditorComposite from './EditorComposite.js'
/**
 * Composite Preview on Editor
 **/
class PreviewComposite extends EditorComposite {
  createElement (config, i) {
    return new Element({
      compositeView: this,
      config,
      i
    })
  }

  updateViewPort (width, height) {
    this.el.style.width = width + 'px'
    this.el.style.height = height + 'px'
  }

  /**
   * Load Composite Store
   **/
  async loadStore () {
    this.store = new ValtioStore()
    this.store.load(this.jsModules)

    // this.context.delegateMethods(this.store, ['subscribe', 'dispatchStateChange', 'doStoreAction', 'getStoreValue'])
  }

  unmount () {
    super.unmount()
    // this.context.unDelegateMethods(this.store, ['subscribe', 'dispatchStateChange', 'doStoreAction', 'getStoreValue'])
    this.el.style.width = 0
    this.el.style.height = 0
  }
}

export default PreviewComposite
