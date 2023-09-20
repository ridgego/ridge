import EventEmitter from 'eventemitter3'
import Ridge from 'ridge-runtime'

import ApplicationService from './ApplicationService.js'
import WorkSpaceControl from '../workspace/WorkspaceControl.js'

const appService = new ApplicationService()
const workspaceControl = new WorkSpaceControl()

window.NPM_CDN_URL = ''
// eslint-disable-next-line
const baseUrl = (location.host.startsWith('localhost') || location.host.startsWith('127.0.0.1')) ? '/npm' : NPM_CDN_SERVER
const ridge = new Ridge({
  baseUrl
})

ridge.appService = appService
ridge.workspaceControl = workspaceControl

window.Ridge = ridge

const ee = new EventEmitter()
const emit = ee.emit.bind(ee)
const on = ee.on.bind(ee)

ridge.ee = ee

export {
  workspaceControl,
  appService,
  on,
  emit,
  ridge
}
