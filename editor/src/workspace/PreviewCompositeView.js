import { ValtioStore, ComponentView } from 'ridge-runtime'
import EditorCompositeView from './EditorCompositeView.js'
/**
 * Composite Preview on Editor
 **/
class PreviewCompositeView extends EditorCompositeView {
  createComponentView (config, i) {
    return new ComponentView({
      context: this.context,
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

    this.context.delegateMethods(this.store, ['subscribe', 'dispatchStateChange', 'doStoreAction', 'getStoreValue'])
  }

  unmount () {
    super.unmount()
    this.el.style.width = 0
    this.el.style.height = 0
  }
}

export default PreviewCompositeView
