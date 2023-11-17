/* global location */
/* global localStorage */
import Debug from 'debug'
import RidgeContext, { ComponentView, CompositeView } from 'ridge-runtime'
import ApplicationService from './ApplicationService.js'
import WorkSpaceControl from '../workspace/WorkspaceControl.js'

import EditorCompositeView from '../workspace/EditorCompositeView.js'
import PreviewCompositeView from '../workspace/PreviewCompositeView.js'

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
  // Check && Guess ComponentView
  getComponentView (prm) {
    if (prm instanceof ComponentView) {
      return prm
    } else if (typeof prm === 'string') {
      if (this.editorView) {
        return this.editorView.getComponentView(prm)
      } else if (this.runtimeView) {
        return this.runtimeView.getComponentView(prm)
      }
    } else if (prm instanceof Node) {
      return prm.view
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
   * Load page to current editor view, enable workspace control and edit panels
   **/
  async loadPage (page) {
    if (page) {
      this.pageContent = page.content
    }
    if (this.editorView) {
      await this.saveCurrentPage()
      this.editorView.unmount()
    }

    this.editorView = new EditorCompositeView({
      config: this.pageContent,
      el: this.viewPortContainerEl,
      context: this
    })

    this.editorView.updateStyle()
    if (!this.workspaceControl.enabled) {
      this.workspaceControl.enable()
    }

    const zoom = this.workspaceControl.fitToCenter()
    this.Editor.togglePageEdit()
    await this.editorView.loadAndMount(this.viewPortContainerEl)
    const { configPanel, outlinePanel, menuBar } = this.services
    menuBar.setZoom(zoom)
    configPanel.updatePageConfigFields()
    outlinePanel.updateOutline()

    this.workspaceControl.selectElements([])  
  }

  /**
   * Load current page to preview mode
   **/
  async loadPreview () {
    // load view
    this.runtimeView = new PreviewCompositeView({
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
    const view = this.getComponentView(element)
    if (view) {
      configPanel.componentSelected(view)
      outlinePanel.setCurrentNode(view)
      view.onSelected()
    }
    this.el = view
  }

  /**
   * 元素移除触发
   **/
  onElementRemoved (element) {
    const view = this.getComponentView(element)
    if (view && this.editorView) {
      this.editorView.deleteElementView(view)
    }
    const { outlinePanel } = this.services
    outlinePanel.updateOutline()
  }

  /**
   * Move end event(from workspace) handler
   **/
  onElementMoveEnd (element) {
    const { configPanel, outlinePanel } = this.services
    const view = this.getComponentView(element)
    if (view) {
      configPanel.updateComponentConfig(view)
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
