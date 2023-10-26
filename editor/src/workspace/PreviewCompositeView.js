import { CompositeView } from 'ridge-runtime'
import EditorComponentView from './EditorComponentView.js'
import EditorStore from './EditorStore.js'
/**
 * Composite Preview on Editor
 **/
class PreviewCompositeView extends CompositeView {
  createComponentView (config, i) {
    return new EditorComponentView({
      context: this.context,
      config,
      i
    })
  }

  updateStyle () {
    super.updateStyle()
    if (this.config.style) {
      const { width, height } = this.config.style

      this.el.style.width = width + 'px'
      this.el.style.height = height + 'px'
    }
  }

  /**
   * 更新页面引入的样式表
   */
  async importStyleFiles () {
    const oldStyles = document.querySelectorAll('style[page-id="' + this.config.id + '"]')
    for (const styleEl of oldStyles) {
      document.head.removeChild(styleEl)
    }

    const { cssFiles } = this.config
    const { appService } = this.context.services
    this.classNames = []
    for (const filePath of cssFiles || []) {
      const file = appService.getFileByPath(filePath)

      if (file) {
        if (!file.textContent) {
          file.textContent = await appService.getFileContent(file)
        }
        const styleEl = document.createElement('style')
        styleEl.setAttribute('page-id', this.config.id)
        document.head.appendChild(styleEl)
        styleEl.textContent = '\r\n' + file.textContent
        // 计算使用的样式
        const matches = file.textContent.match(/\/\*.+\*\/[^{]+{/g)
        for (const m of matches) {
          const label = m.match(/\/\*.+\*\//)[0].replace(/[/*]/g, '')
          const className = m.match(/\n[^{]+/g)[0].trim().substring(1)

          this.classNames.push({
            className,
            label
          })
        }
      }
    }
  }

  /**
   * Import JS Files
   */
  async importJSFiles () {
    this.storeModules = {}
    const oldScripts = document.querySelectorAll('script[page-id="' + this.config.id + '"]')
    for (const scriptEl of oldScripts) {
      document.head.removeChild(scriptEl)
    }
    const { jsFiles, storeFiles } = this.config
    for (const filePath of jsFiles || []) {
      await this.importJSFile(filePath)
    }
    for (const filePath of storeFiles || []) {
      await this.importJSFile(filePath, true)
    }
  }

  async importJSFile (jsPath, isStore) {
    const { appService } = this.context.services
    const file = appService.getFileByPath(jsPath)
    if (file) {
      if (!file.textContent) {
        file.textContent = await appService.getFileContent(file)
      }
      const scriptEl = document.createElement('script')
      scriptEl.setAttribute('page-id', this.config.id)
      scriptEl.setAttribute('type', 'module')

      let jsContent = file.textContent
      if (isStore) {
        if (jsContent.indexOf('export default')) {
          jsContent = jsContent.replace('export default', 'window["' + jsPath + '"]=')
        }
      }
      scriptEl.textContent = jsContent
      document.head.append(scriptEl)
      if (isStore) {
        this.storeModules[jsPath] = window[jsPath]
      }
    }
  }

  /**
   * Load Composite Store
   * */
  async loadStore () {
    this.store = new EditorStore()

    this.store.updateStore(this.storeModules)

    // await this.store.updateStore((this.config.storeFiles || []).map(storePath => this.context.baseUrl + '/' + this.app + '/' + storePath))

    // this.context.delegateMethods(this.store, ['subscribe', 'dispatchStateChange', 'doStoreAction', 'getStoreValue'])
  }

  unmount () {
    super.unmount()
    this.el.style.width = 0
    this.el.style.height = 0
  }
}

export default PreviewCompositeView
