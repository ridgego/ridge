import debug from 'debug'
import { proxy, subscribe, snapshot } from 'valtio/vanilla'
import StoreObject from './StoreObject'

const log = debug('ridge:store')
const error = debug('ridge:store-error')
/**
 * Store engine based on Valtio Lib(Proxied Object)
 **/
export default class ValtioStore {
  constructor (composite) {
    this.composite = composite // 所在组件
    this.properties = composite.properties // 初始化store参数属性

    // Store定义
    this.storeModules = {}

    // 仓库对象
    this.storeObjects = {}
    // Store实时状态
    this.storeStates = {}

    // 状态监听者
    this.stateWatchers = {}
    // 组件及更新方法映射
    this.callbackMap = new Map()
    this.scheduledJobs = new Set()
  }

  // 更改参数，更改后，store按属性重新更新状态
  setProperties (properties) {
    this.properties = properties
    for (const storeObject of Object.values(this.storeObjects)) {
      storeObject.updateProps(properties)
    }
  }

  /**
   * Load & Init JS-Stores
   **/
  load (modules) {
    for (const StoreModule of modules) {
      this.registerPageStore(StoreModule)
    }
  }

  /**
   * 获取状态值，支持以下格式
   * 'storeName.state.stateName'
   * 'storeName.computed.computeValue'
   * 'storeName.scoped.scopeCal'
   * @param {*} expr 状态值表达式
   * @param {*} payload 为scoped时 计算的参数
   * @returns
   */
  getStoreValue (expr, payload) {
    const [storeKey, type, stateName] = expr.split('.')

    if (this.storeObjects[storeKey]) {
      return this.storeObjects[storeKey].getValue(type, stateName, payload)
    }
  }

  // 对表达式进行订阅
  subscribe (expr, cb, uuid) {
    const [storeKey, type, stateName] = expr.split('.')
    log('subscribe', expr)

    if (this.storeObjects[storeKey]) {
      this.storeObjects[storeKey].subscribe(type, stateName, cb)
    }
  }

  dispatchChange (expr, payload) {
    const [storeKey, type, stateName] = expr.split('.')
    if (this.storeObjects[storeKey]) {
      this.storeObjects[storeKey].dispatchChange(type, stateName, payload)
    }
  }

  doStoreAction (storeName, actionName, event, scopedData) {
    if (this.storeObjects[storeName]) {
      this.storeObjects[storeName].doStoreAction(actionName, event, scopedData)
    }
  }

  /**
   * 进行Store初始化
   * @param {*} moduleName
   * @param {*} storeModule
   */
  registerPageStore (StoreModule) {
    log('RegisterPageStore', StoreModule)
    if (!StoreModule.name) {
      log('Store Not Registered: No Name')
      return
    }
    const moduleName = StoreModule.name

    this.storeObjects[moduleName] = new StoreObject(StoreModule, this.composite)
    this.storeObjects[moduleName].initStore(this.properties)
  }
}
