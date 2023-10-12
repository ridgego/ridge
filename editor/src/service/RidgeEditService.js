import EventEmitter from 'eventemitter3'
import Ridge from 'ridge-runtime'

import ApplicationService from './ApplicationService.js'
import WorkSpaceControl from '../workspace/WorkspaceControl.js'
import EditorCompositeView from '../workspace/EditorCompositeView.js'


const NPM_CDN_SERVER = 

class RidgeEditService {
  constructor() {
    this.appService = new ApplicationService()
    this.workspaceControl = new WorkSpaceControl()

    // eslint-disable-next-line
    const baseUrl = (location.host.startsWith('localhost') || location.host.startsWith('127.0.0.1')) ? '/npm' : NPM_CDN_SERVER
    const ridge = new Ridge({
      baseUrl
    })
    ridge.appService = appService
    window.Ridge = ridge



  }

  setEditor(Editor) {
    this.Editor = Editor
  }


  async saveCurrentPage() {
    if (this.editorView) {
      const pageJSONObject = this.editorView.getPageJSON()
      try {
        await this.appService.savePageContent(this.editorView.id, pageJSONObject)
      } catch (e) {
        console.error('save page error', e)
      }
    }
  }

  async openFile(id) {
    const file = await appService.getFile(id)
    if (file) {
        if (file.type === 'page') {
          await this.saveCurrentPage()
          if (this.editorView) {
            this.editorView.unmount()
          }

          if (!this.workspaceControl.enabled) {
            this.workspaceControl.enable()
          }
          this.loadPage(file)
          workspaceControl.selectElements([])
        }
      }
  }

const ee = new EventEmitter()
const emit = ee.emit.bind(ee)
const on = ee.on.bind(ee)

ridge.ee = ee

const openFile = async id => {
  
}

export {
  openFile,
  workspaceControl,
  appService,
  on,
  emit,
  ridge
}
