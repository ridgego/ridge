import EventEmitter from 'eventemitter3'

const ee = new EventEmitter()
const emit = ee.emit.bind(ee)
const on = ee.on.bind(ee)
export {
  emit,
  on
}
