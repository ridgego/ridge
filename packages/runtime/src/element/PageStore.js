import { defineStore, createPinia, storeToRefs } from 'pinia'
import { watch } from 'vue'
import { isObject } from '../utils/is'

export default class PageStore {
  constructor (pageElementManager) {
    this.pageElementManager = pageElementManager
    this.ridge = pageElementManager.ridge
    // if (!this.ridge.pinia) {
    this.ridge.pinia = createPinia()
    // }
    // 一个页面支持多个store
    this.storeObjects = {} // 定义
    this.stores = {} // pinia store
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

    if (this.stores[storeKey]) {
      this.stores[storeKey].$patch({
        [path.join('.')]: val
      })
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

  updateStore () {
    const { pageConfig } = this.pageElementManager
    const { properties, id } = pageConfig
    const scriptEls = document.querySelectorAll('script.page-' + id)
    for (const el of scriptEls) {
      document.head.removeChild(el)
    }
    this.stores = {}

    if (properties.jsFiles && properties.jsFiles.length) {
      for (const jsFilePath of properties.jsFiles) {
        if (this.pageElementManager.mode !== 'hosted') {
          // 从localStorage读取JS内容
          const file = this.ridge.appService.filterFiles(f => f.path === jsFilePath)[0]
          if (file) {
            const moduleName = file.label.substring(0, file.label.length - 3)
            const scriptDiv = document.createElement('script')
            // scriptDiv.setAttribute('type', 'module')
            scriptDiv.classList.add('page-' + id)
            scriptDiv.textContent = file.textContent
            document.head.append(scriptDiv)
            // Store类型，做相关pinia初始化
            if (globalThis[moduleName] && globalThis[moduleName].state) {
              this.registerPageStore(moduleName, globalThis[moduleName])
            }
          }
        }
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

    const useModuleStore = defineStore(moduleName, storeModule)
    this.stores[moduleName] = useModuleStore(this.ridge.pinia)
    const refs = storeToRefs(this.stores[moduleName])
    this.storeTrees[moduleName] = this.parseStoreTree(moduleName, storeModule)

    this.watcherCallbacks[moduleName] = {}
    const treeState = this.storeTrees[moduleName].states

    this.stores[moduleName].$subscribe((mutation, state) => {
      console.log('Store Mutation', mutation.type, mutation.payload, mutation.storeId)
    })
    for (const state of treeState) {
      watch(refs[state.key], (val) => {
        for (const cb of this.watcherCallbacks[moduleName][state.key]) {
          cb()
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
    const alias = storeDefModule.alias || {}
    if (storeDefModule.state && typeof storeDefModule.state === 'function') {
      const stateObject = storeDefModule.state()

      tree.states = this.getChildrenFromPlainObject(stateObject, moduleName, alias)
    }

    if (storeDefModule.getters && typeof storeDefModule.getters === 'object') {
      Object.keys(storeDefModule.getters).forEach(key => {
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
