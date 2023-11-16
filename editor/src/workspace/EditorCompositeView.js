import { CompositeView } from 'ridge-runtime'
import EditorComponentView from './EditorComponentView.js'
import { nanoid } from '../utils/string'
/**
 * Views Mount on Editor
 **/
class EditorCompositeView extends CompositeView {
  createComponentView (config, i) {
    return new EditorComponentView({
      compositeView: this,
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
    this.refresh()
  }

  async refresh () {
    await this.importStyleFiles()
    await this.importJSFiles()

    this.loadStore()
  }

  /**
   * Load Composite Store
   * */
  async loadStore () {
    this.storeModules = []
    for (const jsModules of this.jsModules) {
      if (jsModules && jsModules.name) {
        this.parseJsStoreModule(jsModules)
      }
    }
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
    const oldScripts = document.querySelectorAll('script[page-id="' + this.config.id + '"]')
    for (const scriptEl of oldScripts) {
      document.head.removeChild(scriptEl)
    }
    const { jsFiles } = this.config
    for (const filePath of jsFiles || []) {
      const jsStoreModule = await this.importJSFile(filePath, true)
      if (jsStoreModule) {
        this.jsModules.push(jsStoreModule)
      }
    }
  }

  async importJSFile (jsPath) {
    const { appService } = this.context.services
    const file = appService.getFileByPath(jsPath)
    if (file) {
      if (!file.textContent) {
        file.textContent = await appService.getFileContent(file)
      }
      const scriptEl = document.createElement('script')
      scriptEl.setAttribute('page-id', this.config.id)

      const jsGlobal = 'ridge-store-' + nanoid(10)
      scriptEl.textContent = file.textContent.replace('export default', 'window["' + jsGlobal + '"]=')

      try {
        document.head.append(scriptEl)
        return window[jsGlobal]
      } catch (e) {
        console.error('Store Script Error', e)
        return null
      }
    }
  }

  parseJsStoreModule (jsStoreModule) {
    const storeModule = {
      module: jsStoreModule,
      name: jsStoreModule.name ?? '未命名', // module name
      actions: [], // module actions
      states: [], // module global state includes computed, but only on runtime they are different
      scoped: [] // only for scoped binding (now only list)
    }
    this.storeModules.push(storeModule)

    if (jsStoreModule.state) {
      let initStateObject = {}
      if (typeof jsStoreModule.state === 'function') {
        initStateObject = jsStoreModule.state()
      } else if (typeof jsStoreModule.state === 'object') {
        initStateObject = jsStoreModule.state
      }
      for (const key of Object.keys(initStateObject)) {
        storeModule.states.push({
          name: key
        })
      }
    }

    if (jsStoreModule.scoped) {
      for (const key of Object.keys(jsStoreModule.scoped)) {
        storeModule.scoped.push({
          name: key
        })
      }
    }

    if (jsStoreModule.actions && typeof jsStoreModule.actions === 'object') {
      Object.keys(jsStoreModule.actions || {}).forEach(key => {
        storeModule.actions.push({
          name: key
        })
      })
    }
  }

  getStoreModules () {
    return this.storeModules
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
      compositeView: this,
      i: Object.entries(this.componentViews).length + 1
    })
    view.initPropsOnCreate()
    this.componentViews[view.config.id] = view
    return view
  }

  unmount () {
    super.unmount()
    this.el.style.width = 0
    this.el.style.height = 0
  }

  deleteView (view) {
    if (view) {
      if (view.config.parent) {
        this.detachFromParent(view, true)
      }
      // delete recursively
      view.forEachChildren(childView => {
        this.deleteView(childView)
      })
      view.unmount()
      delete this.componentViews[view.config.id]
    }
  }

  /**
   * 附加子节点到父节点，并给出节点位置以方便父节点排列
   * @param childView 子节点view
   * @param parentView 父节点view
   * @param position
   */
  appendChildView (childView, parentView, position = { x: 0, y: 0 }) {
    if (!parentView.hasMethod('appendChild')) {
      return false
    }
    // 这里容器会提供 appendChild 方法，并提供放置位置
    const result = parentView.invoke('appendChild', [childView, position.x, position.y])

    if (result.indexOf(childView.config.id) > -1) {
      childView.config.parent = parentView.config.id
    }

    parentView.updateConfig({
      props: {
        children: result
      }
    })
  }

  /**
     * 当子节点从父节点移出后，（包括SLOT）重新更新父节点配置
     * @param {*} sourceParentElement 父节点
     * @param {*} childElementId 子节点
     */
  detachFromParent (view, isDelete) {
    const containerView = view.getContainerView()

    if (containerView) {
      const children = containerView.invoke('removeChild', [view, isDelete])
      // 更新配置
      containerView.updateConfig({
        props: {
          children
        }
      })
    }
    delete view.config.parent
  }

  /**
   * 重新排序子节点
   **/
  updateChildOrder (containerView, orders) {
    if (containerView) {
      containerView.invoke('updateOrder', [orders])
      containerView.updateConfig({
        props: {
          children: orders
        }
      })
      // containerView.updateChildren
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
