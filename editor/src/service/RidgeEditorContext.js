/* global location */
/* global localStorage */
import Debug from 'debug'
import RidgeContext, { Element } from 'ridge-runtime'
import ApplicationService from './ApplicationService.js'
import WorkSpaceControl from '../workspace/WorkspaceControl.js'

import EditorComposite from '../workspace/EditorComposite.js'
import PreviewComposite from '../workspace/PreviewComposite.js'

const debug = Debug('ridge:editor')

const NPM_CDN_SERVER = new URLSearchParams(location.href).get('registry') || localStorage.getItem('registry') || 'https://cdn.jsdelivr.net/npm'

// eslint-disable-next-line
const baseUrl = (location.host.startsWith('localhost') || location.host.startsWith('127.0.0.1')) ? '/npm' : NPM_CDN_SERVER

/**
 * 'no-react' service for editor.
 * connect each part and manage state for editor
 **/
class RidgeEditorContext extends RidgeContext {
  constructor ({ baseUrl }) {
    super({ baseUrl })
    this.baseUrl = baseUrl
    // Register For Panel

    this.services.appService = new ApplicationService()
    window.ridge = this
    window.editor = this
  }

  async editorDidMount (Editor, workspaceEl, viewPortContainerEl) {
    this.Editor = Editor
    const { appService } = this.services

    await appService.init()

    this.viewPortContainerEl = viewPortContainerEl
    this.workspaceEl = workspaceEl

    this.workspaceControl = new WorkSpaceControl()

    this.workspaceControl.init({
      workspaceEl,
      viewPortEl: viewPortContainerEl,
      ridgeEditorService: this
    })
    this.Editor.setEditorLoaded()
  }

  /**
   *  Utils Methods
   **/
  // Check && Guess Element
  getNode (prm) {
    if (prm instanceof Element) {
      return prm
    } else if (typeof prm === 'string') {
      if (this.editorView) {
        return this.editorView.getNode(prm)
      } else if (this.runtimeView) {
        return this.runtimeView.getNode(prm)
      }
    } else if (prm instanceof Node) {
      return prm.ridgeNode
    }
    return null
  }

  /**
   * Load Packages in the App
   */
  async loadPackages () {
    const { appService } = this.services
    const packageObject = await appService.getPackageJSONObject()
    if (packageObject == null) {
      return []
    }
    const packageNames = Object.keys(packageObject.dependencies)
    const packagesLoading = []
    // Load Package
    for (const pkname of packageNames) {
      packagesLoading.push(await this.getPackageJSON(pkname))
    }
    await Promise.allSettled(packagesLoading)
    const loadedPackages = packagesLoading.filter(n => n != null).map(pkg => {
      pkg.componentLoaded = false
      if (pkg.icon) {
        pkg.icon = this.baseUrl + '/' + pkg.name + '/' + pkg.icon
      }
      return pkg
    })
    return loadedPackages
  }

  /**
   * Save current edit page
   */
  async saveCurrentPage () {
    if (this.editorView) {
      const { appService } = this.services
      const pageJSONObject = this.editorView.exportPageJSON()

      this.pageJSON = pageJSONObject
      debug('Save Page ', pageJSONObject)
      try {
        await appService.savePageContent(pageJSONObject.id, pageJSONObject)
      } catch (e) {
        console.error('save page error', e)
      }
    }
  }

  /**
   * Open app files in editor space
   */
  async openFile (id) {
    const { appService } = this.services
    const file = await appService.getFile(id)
    if (file) {
      if (file.type === 'page') {
        this.currentOpenFile = file
        await this.loadPage(file)
      } else if (file.mimeType.startsWith('text/')) {
        this.Editor.openCodeEditor(file)
      } else if (file.mimeType.startsWith('image/')) {
        this.Editor.openImage(file.content)
      }
    }
  }

  /**
   * 加载页面到编辑器工作区间
   **/
  async loadPage (page) {
    const { configPanel, outlinePanel, menuBar } = this.services
    if (page) {
      this.pageContent = page.content
    }
    if (this.editorView) {
      // await this.saveCurrentPage()
      this.editorView.unmount()
    }

    this.editorView = new EditorComposite({
      el: this.viewPortContainerEl,
      config: this.pageContent,
      context: this
    })

    this.editorView.updateStyle()

    if (!this.workspaceControl.enabled) {
      this.workspaceControl.enable()
    }
    const zoom = this.workspaceControl.fitToCenter()
    menuBar.setZoom(zoom)

    await this.editorView.load()
    await this.editorView.mount()

    this.Editor.togglePageEdit()
    configPanel.updatePageConfigFields()
    this.workspaceControl.selectElements([])

    outlinePanel.updateOutline()
  }

  /**
   * Load current page to preview mode
   **/
  async loadPreview () {
    // load view
    this.runtimeView = new PreviewComposite({
      config: this.pageContent,
      context: this
    })
    await this.runtimeView.loadAndMount(this.viewPortContainerEl)

    // toggle editor
    this.Editor.togglePagePreview()

    // update view port and fit
    this.runtimeView.updateViewPort(this.pageContent.style.width, this.pageContent.style.height)
    const { previewBar } = this.services
    this.workspaceControl.fitToCenter()

    // update bar
    previewBar.setState({
      width: this.pageContent.style.width,
      height: this.pageContent.style.height
    })
  }

  updatePreviewSize (width, height) {
    this.runtimeView.updateViewPort(width, height)
    this.workspaceControl.fitToCenter()
  }

  /**
   * Switch Design/Preview Mode
   **/
  async toggleMode () {
    // Design -> Preview
    if (this.editorView) {
      await this.saveCurrentPage()
      this.closeCurrentPage()

      this.loadPreview()
    } else if (this.runtimeView) {
      this.runtimeView.unmount()
      await this.loadPage()
    }
  }

  /**
   * Focus on element(from workspace) handler
   **/
  onElementSelected (element) {
    const { configPanel, outlinePanel } = this.services
    const node = this.getNode(element)
    if (node) {
      configPanel.componentSelected(node)
      outlinePanel.setCurrentNode(node)
    }
    this.el = node
  }

  /**
   * 元素移除触发
   **/
  onElementRemoved (element) {
    const view = this.getNode(element)
    if (view && this.editorView) {
      this.editorView.removeChild(view)
    }
    const { outlinePanel } = this.services
    outlinePanel.updateOutline()
  }

  /**
   * Move end event(from workspace) handler
   **/
  onElementMoveEnd (element) {
    const { configPanel, outlinePanel } = this.services
    const node = this.getNode(element)
    if (node) {
      configPanel.updateComponentConfig(node)
      outlinePanel.updateOutline()
    }
  }

  /**
   * Focus on page from workspace
   **/
  onPageSelected () {
    const { configPanel, outlinePanel } = this.services
    this.el = null
    configPanel.updatePageConfigFields()
    outlinePanel.setCurrentNode()
  }

  /**
   * 组件配置属性变更
   **/
  updateComponentConfig (view, config) {
    const titleChanged = config.title !== view.config.title

    view.updateConfig(config)

    if (titleChanged) {
      const { outlinePanel } = this.services
      outlinePanel.updateOutline()
    }

    this.workspaceControl.updateMovable()
  }

  updateComponentStyle (view, config) {
    view.updateStyleConfig(config)
  }

  async onCodeEditComplete (id, code) {
    await this.services.appService.updateFileContent(id, code)

    if (this.editorView) {
      await this.editorView.refresh()
    }
  }

  closeCurrentPage () {
    if (this.editorView) {
      this.editorView.unmount()
    }
    this.editorView = null
    this.workspaceControl.disable()
    this.Editor.togglePageClose()
  }
}

const ridgeEditorContext = new RidgeEditorContext({ baseUrl })

export default ridgeEditorContext
