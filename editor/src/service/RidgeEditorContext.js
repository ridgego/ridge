/* global location */
/* global localStorage */
import Debug from 'debug'
import RidgeContext, { Element } from 'ridge-runtime'
import ApplicationService from './ApplicationService.js'
import WorkSpaceControl from '../workspace/WorkspaceControl.js'
import _ from 'lodash'

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
      if (this.editorComposite) {
        return this.editorComposite.getNode(prm)
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
    if (this.editorComposite) {
      const { appService } = this.services
      const pageJSONObject = this.editorComposite.exportPageJSON()

      debug('Save Page ', pageJSONObject)
      try {
        await appService.savePageContent(this.currentOpenFile.id, pageJSONObject)
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
        await this.loadEdit(file)
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
  async loadEdit (page) {
    const { configPanel, outlinePanel, menuBar } = this.services
    if (page) {
      this.pageContent = page.content
      this.pageContent.name = page.name
    }
    if (this.editorComposite) {
      // await this.saveCurrentPage()
      this.editorComposite.unmount()
    }

    this.editorComposite = new EditorComposite({
      el: this.viewPortContainerEl,
      config: this.pageContent,
      context: this
    })

    this.editorComposite.updateStyle()

    if (!this.workspaceControl.enabled) {
      this.workspaceControl.enable()
    }
    const zoom = this.workspaceControl.fitToCenter()
    menuBar.setZoom(zoom)

    await this.editorComposite.load()
    await this.editorComposite.mount()

    this.Editor.togglePageEdit()
    configPanel.updatePageConfigFields()
    this.workspaceControl.selectElements([])

    outlinePanel.updateOutline(true)
  }

  /**
   * Load current page to preview mode
   **/
  async loadPreview () {
    // load view
    this.runtimeComposite = new PreviewComposite({
      config: this.pageContent,
      context: this
    })
    await this.runtimeComposite.mount(this.viewPortContainerEl)

    // toggle editor
    this.Editor.togglePagePreview()

    // update view port and fit
    this.runtimeComposite.updateViewPort(this.pageContent.style.width, this.pageContent.style.height)
    const { previewBar } = this.services
    this.workspaceControl.fitToCenter()

    // update bar
    previewBar.setState({
      width: this.pageContent.style.width,
      height: this.pageContent.style.height
    })
  }

  updatePreviewSize (width, height) {
    this.runtimeComposite.updateViewPort(width, height)
    this.workspaceControl.fitToCenter()
  }

  /**
   * Switch Design/Preview Mode
   **/
  async toggleMode () {
    // Design -> Preview
    if (this.editorComposite) {
      await this.saveCurrentPage()
      this.closeCurrentPage()
      this.loadPreview()
    } else if (this.runtimeComposite) {
      this.runtimeComposite.unmount()
      await this.loadEdit()
    }
  }

  /**
   * Focus on element(from workspace) handler
   **/
  onElementSelected (element) {
    const { configPanel, outlinePanel } = this.services
    const node = this.getNode(element)

    if (node) {
      node.selected()
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
    if (view && this.editorComposite) {
      this.editorComposite.deleteNode(view)
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
      configPanel.componentSelected(node)
      outlinePanel.updateOutline()
    }
  }

  onFileRenamed (id, newName) {
    if (this.currentOpenFile && this.currentOpenFile.id === id) {
      this.editorComposite.config.name = newName
      const { configPanel, outlinePanel } = this.services

      configPanel.updatePageConfigFields()
    }
  }

  createElement (definition) {
    const div = document.createElement('div')
    const ridgeNode = this.editorComposite.createNewElement(definition)
    ridgeNode.mount(div)

    // 只有mount后才能append
    this.editorComposite.appendChild(ridgeNode)

    return ridgeNode
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
  updateComponentConfig (view, configValues) {
    const config = _.cloneDeep(configValues)
    const titleChanged = config.title !== view.config.title

    view.updateConfig(config)

    if (titleChanged) {
      const { outlinePanel } = this.services
      outlinePanel.updateOutline()
    }

    this.workspaceControl.updateMovable()
  }

  updateComponentStyle (editorElement, config) {
    editorElement.updateStyleConfig(config)
  }

  async onCodeEditComplete (id, code) {
    await this.services.appService.updateFileContent(id, code)

    if (this.editorComposite) {
      await this.editorComposite.refresh()
    }
  }

  closeCurrentPage () {
    if (this.editorComposite) {
      this.editorComposite.unmount()
    }
    this.currentOpenFile = null
    this.editorComposite = null
    this.workspaceControl.disable()
    this.Editor.togglePageClose()
  }
}

const ridgeEditorContext = new RidgeEditorContext({ baseUrl })

export default ridgeEditorContext
