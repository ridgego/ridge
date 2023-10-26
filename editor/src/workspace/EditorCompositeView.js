import { CompositeView } from 'ridge-runtime'
import EditorComponentView from './EditorComponentView.js'
import { nanoid } from '../utils/string'
import EditorStore from './EditorStore.js'
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
  * Create Component Instance by defination
  * @param {Object} defination
  * @returns
  */
  createView (definition) {
    // 生成组件定义
    const elementConfig = {
      title: definition.title,
      id: nanoid(5),
      path: definition.componentPath,
      style: {
        position: 'absolute',
        visible: true,
        width: definition.width ?? 100,
        height: definition.height ?? 100
      },
      styleEx: {},
      props: {},
      propEx: {},
      events: {}
    }

    const view = new EditorComponentView({
      definition,
      config: elementConfig,
      context: this.context,
      i: Object.entries(this.componentViews).length + 1
    })
    view.initPropsOnCreate()
    this.componentViews[view.config.id] = view
    return view
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

  removeElement (view) {
    if (view) {
      if (view.containerView) {
        this.detachChildView(view, true)
      }

      // delete recursively
      view.forEachChildren((childView, type, propKey) => {
        this.removeElement(childView)
      })
      view.unmount()
      delete this.componentViews[view.config.id]
    }
  }

  /**
     * 当子节点从父节点移出后，（包括SLOT）重新更新父节点配置
     * @param {*} sourceParentElement 父节点
     * @param {*} childElementId 子节点
     */
  detachChildView (childView, isDelete) {
    const contanerView = childView.containerView

    // invoke parent view for recalculating
    const result = contanerView.invoke('removeChild', [childView, isDelete])
    Object.assign(contanerView.config.props, result)

    delete childView.config.parent
    delete childView.containerView
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
