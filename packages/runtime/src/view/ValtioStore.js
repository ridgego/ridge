import { isObject } from '../utils/is'
import { filename, nanoid } from '../utils/string'
import { proxy, subscribe } from 'valtio/vanilla'
import { subscribeKey } from 'valtio/utils'

export default class ValtioStore {
  constructor (app, storeFiles) {
    this.storeFiles = storeFiles
    this.app = app
    // 一个页面支持多个store
    this.storeObjects = {} // 定义
    this.stores = {} // valtio state registry
    this.storeTrees = {} //

    this.watcherCallbacks = {}
  }


  /**
   * 获取状态值，支持以下格式
   * 'storeName.stateName'
   * 'storeName.getterName'
   * 'storeName.stateName.stateField'
   * 'storeName.stateName.stateField.subField'
   * @param {*} expr 状态值表达式
   * @param {*} payload 为getter时 计算的参数
   * @returns
   */
  getStoreValue (expr, payload) {
    const [storeKey, ...path] = expr.split('.')
    if (this.stores[storeKey]) {
      // getters
      const result = this.stores[storeKey][path[0]]
      if (typeof result === 'function') {
        return result.apply(null, payload)
      } else {
        return this.getByPath(this.stores[storeKey], path)
      }
    }
  }

  /**
   * 按照路径 获取对象field值
   * @param {Object} o 对象
   * @param {Array} path
   * @returns
   */
  getByPath (o, path) {
    let result = o
    for (let i = 0; i < path.length; i++) {
      if (result == null) {
        break
      }
      result = result[path[i]]
    }
    return result
  }

  /**
   * 执行store值改变
   * @param {*} expr 表达式
   * @param {*} val
   */
  dispatchStateChange (expr, val) {
    const [storeKey, ...path] = expr.split('.')

    if (!this.stores[storeKey]) {
      if (globalThis[storeKey] && globalThis[storeKey].state) {
        this.registerPageStore(storeKey, globalThis[storeKey])
      }
    }

    if (this.stores[storeKey]) {
      this.stores[storeKey][path] = val
    }
  }

  subscribe (expr, cb) {
    const [storeKey, stateExpr] = expr.split('.')

    if (this.watcherCallbacks[storeKey] && this.watcherCallbacks[storeKey][stateExpr]) {
      this.watcherCallbacks[storeKey][stateExpr].push(cb)
    }
  }

  doStoreAction (storeKey, action, payload) {
    if (this.stores[storeKey] && this.stores[storeKey][action]) {
      this.stores[storeKey][action](...payload)
    }
  }

  /**
   * 更新/加载页面的storejs
   */
  async updateStore () {
    const { pageConfig } = this.pageElementManager
    const { storeFiles, id } = pageConfig
    const scriptEls = document.querySelectorAll('script.page-' + id)
    // 删除旧的store代码
    for (const el of scriptEls) {
      document.head.removeChild(el)
    }

    if (storeFiles && storeFiles.length) {
      for (const storeFile of storeFiles) {
        const moduleName = filename(storeFile)
        if (this.pageElementManager.mode !== 'hosted') {
          // 从localStorage读取JS内容
          const file = this.ridge.appService.filterFiles(f => f.path === storeFile)[0]
          if (file) {
            const jsContent = await this.ridge.appService.getFileContent(file)

            const StoreModule = await this.loadStoreModule(null, jsContent)

            if (StoreModule) {
              this.registerPageStore(moduleName, StoreModule)
            }
          }
        } else {
          const StoreModule = await this.loadStoreModule(`${this.ridge.baseUrl}/${this.pageElementManager.app}${storeFile}`)
          if (StoreModule) {
            if (StoreModule) {
              this.registerPageStore(moduleName, StoreModule)
            }
          }
        }
      }
    }
  }

  /**
   * 加载 store.js代码并返回store模块
   */
  async loadStoreModule (jsPath, jsContent) {
    if (jsPath) {
      const resolveKey = 'resolve' + nanoid(5)
      const scriptDiv = document.createElement('script')
      scriptDiv.setAttribute('type', 'module')
      scriptDiv.setAttribute('async', true)
      document.head.append(scriptDiv)
      scriptDiv.textContent = `import * as Module from '${jsPath}'; window['${resolveKey}'](Module);`
      return await new Promise((resolve, reject) => {
        window[resolveKey] = (Module) => {
          delete window[resolveKey]
          resolve(Module)
        }
      })
    } else if (jsContent) {
      const scriptDiv = document.createElement('script')
      document.head.append(scriptDiv)
      const randomModuleKey = 'Module-' + nanoid(5)

      if (jsContent.indexOf('export default') > -1) {
        jsContent = jsContent.replace('export default', `window['${randomModuleKey}']=`)
      }
      scriptDiv.textContent = jsContent

      if (window[randomModuleKey]) {
        const moduleD = window[randomModuleKey]
        delete window[randomModuleKey]
        return moduleD
      } else {
        return null
      }
    }
  }

  /**
   * 使用Pinia引擎进行store初始化
   * @param {*} moduleName
   * @param {*} storeModule
   */
  registerPageStore (moduleName, storeModule) {
    this.storeObjects[moduleName] = storeModule

    this.stores[moduleName] = {}

    if (typeof storeModule.state === 'function') {
      this.stores[moduleName].state = proxy(storeModule.state())
    }

    if (storeModule.computed) {
      this.stores[moduleName].computed = {}
      for (const key of Object.keys(storeModule.computed)) {
        const computedState = storeModule.computed[key]
        if (typeof computedState === 'function') { // only getter
          this.stores[moduleName].computed[key] = computedState(this.stores[moduleName].state)
        }
      }
    }

    this.storeTrees[moduleName] = this.parseStoreTree(moduleName, storeModule)

    subscribe(this.stores[moduleName], newState => {

    })
    this.watcherCallbacks[moduleName] = {}
    const treeState = this.storeTrees[moduleName].states

    for (const state of treeState) {
      subscribeKey(this.stores[moduleName], state.key, (val) => {
        for (const cb of this.watcherCallbacks[moduleName][state.key]) {
          cb.apply(this.stores[moduleName])
        }
      }, {
        deep: true
      })
      this.watcherCallbacks[moduleName][state.key] = []
    }
  }

  getStoreTrees () {
    return this.storeTrees
  }

  parseStoreTree (moduleName, storeDefModule) {
    const tree = {
      states: [],
      actions: []
    }
    const alias = storeDefModule.displayNames || {}
    if (storeDefModule.state && typeof storeDefModule.state === 'function') {
      const stateObject = storeDefModule.state()

      tree.states = this.getChildrenFromPlainObject(stateObject, moduleName, alias)
    }

    if (storeDefModule.computed && typeof storeDefModule.computed === 'object') {
      Object.keys(storeDefModule.computed).forEach(key => {
        tree.states.push({
          label: alias[key] || key,
          value: moduleName + '.' + key,
          key
        })
      })
    }

    if (storeDefModule.actions && typeof storeDefModule.actions === 'object') {
      Object.keys(storeDefModule.actions || {}).forEach(key => {
        tree.actions.push({
          label: alias[key] || key,
          value: key,
          key
        })
      })
    }
    return tree
  }

  getChildrenFromPlainObject (object, path, labelMap) {
    const treeData = []
    Object.keys(object).forEach(key => {
      const nodePath = (path ? (path + '.') : '') + key
      const treeNode = {
        label: labelMap[nodePath] || labelMap[key] || key,
        value: nodePath,
        key
      }

      if (isObject(object[key])) {
        treeNode.children = this.getChildrenFromPlainObject(object[key], nodePath, labelMap)
      }
      treeData.push(treeNode)
    })
    return treeData
  }
}
