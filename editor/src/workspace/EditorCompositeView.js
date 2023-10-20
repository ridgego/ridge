import { CompositeView } from 'ridge-runtime'
import EditorComponentView from './EditorComponentView.js'

/**
 * Views Mount on Editor
 **/
class EditorCompositeView extends CompositeView {
  createComponentView (config, i) {
    return new EditorComponentView({
      context: this.context,
      config,
      i
    })
  }

  getClassNames () {
    return this.classNames || []
  }

  updatePageConfig (config) {
    Object.assign(this.config, config)

    this.updateStyle()
  }

  async refresh () {
    await this.importStyleFiles()
    await this.importJSFiles()
    await this.loadStore()
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
  /**
   * 更新页面引入的样式表
   */
  async importJSFiles () {
    this.storeModules = {}
    const oldScripts = document.querySelectorAll('script[page-id="' + this.config.id + '"]')
    for (const scriptEl of oldScripts) {
      document.head.removeChild(scriptEl)
    }

    const { jsFiles } = this.config
    const { appService } = this.context.services
    for (const filePath of jsFiles || []) {
      const file = appService.getFileByPath(filePath)
      if (file) {
        if (!file.textContent) {
          file.textContent = await appService.getFileContent(file)
        }
        const scriptEl = document.createElement('script')
        scriptEl.setAttribute('page-id', this.config.id)
        scriptEl.setAttribute('type', 'module')

        let jsContent = file.textContent
        if (jsContent.indexOf('export default')) {
          jsContent = jsContent.replace('export default', 'window["' + filePath + '"]=') 
        }
        scriptEl.textContent = jsContent
        document.head.append(scriptEl)
        this.storeModules[filePath] = window[filePath]
      }
    }
  }

  /**
   * Load Composite Store
   * */
  async loadStore () {
    // this.store = new ValtioStore ()

    // await this.store.updateStore((this.config.storeFiles || []).map(storePath => this.context.baseUrl + '/' + this.app + '/' + storePath))

    // this.context.delegateMethods(this.store, ['subscribe', 'dispatchStateChange', 'doStoreAction', 'getStoreValue'])
  }

  unmount () {
    super.unmount()
    this.el.style.width = 0
    this.el.style.height = 0
  }

  // 放置wrapper到target之后，
  setPositionAfter (view, targetView) {
    const siblings = Object.values(this.componentViews).filter(one => one.config.parent === targetView.config.parent).sort((a, b) => {
      return a.i - b.i
    })

    let begin = false
    for (let i = 0; i < siblings.length; i++) {
      if (siblings[i] === view) {
        begin = true
        continue
      }
      if (begin) {
        siblings[i].setIndex(i - 1)
      }
      if (siblings[i] === targetView) {
        view.setIndex(i)
        break
      }
    }
  }

  // 放置wrapper到target之前（之前wrapper在target之后）
  setPositionBefore (view, targetView) {
    const siblings = Object.values(this.componentViews).filter(one => one.config.parent === targetView.config.parent).sort((a, b) => {
      return a.i - b.i
    })

    let begin = false
    for (let i = 0; i < siblings.length; i++) {
      if (begin) {
        siblings[i].setIndex(i + 1)
      }
      if (siblings[i] === targetView) {
        begin = true
        view.setIndex(i)
        continue
      }
      if (siblings[i] === view) {
        break
      }
    }
  }

  exportPageJSON () {
    this.config.elements = []
    for (const componentView of Object.values(this.componentViews).sort((a, b) => a.i - b.i)) {
      this.config.elements.push(componentView.exportJSON())
    }
    return JSON.parse(JSON.stringify(this.config))
  }
}

export default EditorCompositeView
