/* global location */
/* global localStorage */
import Debug from 'debug'
import RidgeContext from 'ridge-runtime'
import ApplicationService from './ApplicationService.js'
import WorkSpaceControl from '../workspace/WorkspaceControl.js'
import EditorCompositeView from '../workspace/EditorCompositeView.js'

const debug = Debug('ridge:editor')

const NPM_CDN_SERVER = new URLSearchParams(location.href).get('registry') || localStorage.getItem('registry') || 'https://cdn.jsdelivr.net/npm'

// eslint-disable-next-line
const baseUrl = (location.host.startsWith('localhost') || location.host.startsWith('127.0.0.1')) ? '/npm' : NPM_CDN_SERVER

/**
 * 'no-react' service for editor.
 * connect each part and manage state for editor
 **/
class RidgeEditorService extends RidgeContext {
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
  
  emptyView () {
    this.workspaceControl.disable()
  }

  runtimeView () {

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
        await this.loadPage()
      } else if (file.mimeType.startsWith('text/')) {
        this.Editor.openCodeEditor(file)
      } else if (file.mimeType.startsWith('image/')) {
        this.Editor.openImage(file.content)
      }
    }
  }

  async loadPage () {
    if (this.editorView) {
      await this.saveCurrentPage()
      this.editorView.unmount()
    }

    this.editorView = new EditorCompositeView({
      config: this.currentOpenFile.content,
      context: this
    })

    // this.viewPortContainerEl.style.width = page.style
    await this.editorView.loadAndMount(this.viewPortContainerEl)
    if (!this.workspaceControl.enabled) {
      this.workspaceControl.enable()
    }
    this.workspaceControl.fitToCenter()

    const { configPanel, outlinePanel } = this.services
    configPanel.updatePageConfigFields()
    outlinePanel.updateOutline()

    this.workspaceControl.selectElements([])

    this.Editor.togglePageEdit()
  }

  /**
   * Focus on element(from workspace) handler
   **/
  onElementSelected (element) {
    const { configPanel, outlinePanel } = this.services
    let view = element
    if (element instanceof Node) {
      view = element.view
    }
    if (view) {
      configPanel.componentSelected(view)
      outlinePanel.setCurrentNode(view)
    }
    this.el = view
  }

  /**
   * Move end event(from workspace) handler
   **/
  onElementMoveEnd (element) {
    const { configPanel } = this.services
    let view = element
    if (element instanceof Node) {
      view = element.view
    }
    if (view) {
      configPanel.updateComponentConfig(element)
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
   * trigger Component props change
   **/
  updateComponentConfig (view, config) {
    const { outlinePanel } = this.services
    view.updateConfig(config)
    outlinePanel.updateComponentConfig(view, config)
    this.workspaceControl.updateMovable()
  }

  updateComponentStyle (view, config) {
    view.updateStyleConfig(config)
  }

  updatePageConfig (values, field) {
    this.editorView.updatePageConfig(values)
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

const ridgeEditorContext = new RidgeEditorService({ baseUrl })

export default ridgeEditorContext
