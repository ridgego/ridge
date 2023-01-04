import EventEmitter from 'eventemitter3'

import { Ridge } from 'ridge-runtime'

import ApplicationService from './ApplicationService.js'
import ConfigService from './ConfigService.js'

const configService = new ConfigService()
const appService = new ApplicationService()
const config = configService.getConfig()

const ridge = new Ridge({
  debugUrl: config.debug ? config.debugUrl : null
})
ridge.configService = configService
ridge.appService = appService

window.Ridge = ridge

const ee = new EventEmitter()
const emit = ee.emit.bind(ee)
const on = ee.on.bind(ee)

export {
  on,
  emit,
  ridge
}
