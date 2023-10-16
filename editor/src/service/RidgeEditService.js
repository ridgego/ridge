import Ridge from 'ridge-runtime'

import ApplicationService from './ApplicationService.js'
import WorkSpaceControl from '../workspace/WorkspaceControl.js'
import EditorCompositeView from '../workspace/EditorCompositeView.js'

// eslint-ignore-next-line
const NPM_CDN_SERVER = new URLSearchParams(location.href).get('registry') || localStorage.getItem('registry') || 'https://cdn.jsdelivr.net/npm'

class RidgeEditService {
  constructor () {
    this.appService = new ApplicationService()

    // eslint-disable-next-line
    const baseUrl = (location.host.startsWith('localhost') || location.host.startsWith('127.0.0.1')) ? '/npm' : NPM_CDN_SERVER

    this.ridgeContext = new Ridge({
      baseUrl
    })
    this.ridgeContext.appService = this.appService

    this.panels = {}
    window.ridge = this.ridgeContext
    window.editor = this
  }

  editorDidMount (Editor, workspaceEl, viewPortContainerEl) {
    this.Editor = Editor
    this.viewPortContainerEl = viewPortContainerEl
    this.workspaceEl = workspaceEl

    this.workspaceControl = new WorkSpaceControl()
    this.ridgeContext.workspaceControl = this.workspaceControl

    this.workspaceControl.init({
      workspaceEl,
      viewPortEl: viewPortContainerEl,
      ridgeEditorService: this
    })
  }

  onElementSelected (el) {

  }

  emptyView () {
    this.workspaceControl.disable()
  }

  runtimeView () {

  }

  async getAppFileTree () {
    return await this.appService.getAppFileTree()
  }

  async loadPackages () {
    const packageObject = await this.appService.getPackageJSONObject()
    if (packageObject == null) {
      return []
    }
    const packageNames = Object.keys(packageObject.dependencies)
    const packagesLoading = []
    // Load Package
    for (const pkname of packageNames) {
      packagesLoading.push(await this.ridge.getPackageJSON(pkname))
    }
    await Promise.allSettled(packagesLoading)
    const loadedPackages = packagesLoading.filter(n => n != null).map(pkg => {
      pkg.componentLoaded = false
      if (pkg.icon) {
        pkg.icon = this.ridge.baseUrl + '/' + pkg.name + '/' + pkg.icon
      }
      return pkg
    })
    return loadedPackages
  }

  async saveCurrentPage () {
    if (this.editorView) {
      const pageJSONObject = this.editorView.getPageJSON()
      try {
        await this.appService.savePageContent(this.editorView.id, pageJSONObject)
      } catch (e) {
        console.error('save page error', e)
      }
    }
  }

  async openFile (id) {
    const file = await this.appService.getFile(id)
    if (file) {
      if (file.type === 'page') {
        await this.saveCurrentPage()
        if (this.editorView) {
          this.editorView.unmount()
        }
        this.loadPage(file)
        this.workspaceControl.selectElements([])

        this.Editor.togglePageEdit()
      }
    }
  }

  loadPage (page) {
    this.editorView = new EditorCompositeView({
      config: page.content,
      context: this.ridgeContext
    })
    this.editorView.loadAndMount(this.viewPortContainerEl)
    if (!this.workspaceControl.enabled) {
      this.workspaceControl.enable()
    }
  }
}

const ridgeEditService = new RidgeEditService()

export default ridgeEditService
