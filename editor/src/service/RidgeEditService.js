import EventEmitter from 'eventemitter3'
import Ridge from 'ridge-runtime'

import ApplicationService from './ApplicationService.js'
import BackUpService from './BackUpService.js'
import ConfigService from './ConfigService.js'
import WorkSpaceControl from '../workspace/WorkspaceControl.js'

const configService = new ConfigService()
const appService = new ApplicationService()
const backUpService = new BackUpService(appService)
const config = configService.getConfig()
const workspaceControl = new WorkSpaceControl()

const ridge = new Ridge({
  debugUrl: config.debug ? config.debugUrl : null
})
ridge.configService = configService
ridge.appService = appService
ridge.backUpService = backUpService
ridge.workspaceControl = workspaceControl

window.Ridge = ridge

const ee = new EventEmitter()
const emit = ee.emit.bind(ee)
const on = ee.on.bind(ee)

ridge.ee = ee

export {
  workspaceControl,
  backUpService,
  appService,
  configService,
  config,
  on,
  emit,
  ridge
}
