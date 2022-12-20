import ElementWrapper from './ElementWrapper'
import { trim } from '../utils/string'
import { pe } from '../utils/expr'

class PageElementManager {
  constructor (pageConfig, ridge, wrapperClass) {
    this.pageConfig = pageConfig
    this.ridge = ridge
    this.ElementWrapper = wrapperClass || ElementWrapper
    this.initialize()
  }

  getPageProperties () {
    return this.pageConfig.properties
  }

  updatePageProperties (properties) {
    this.pageConfig.properties = properties
  }

  getElement (id) {
    return this.pageElements[id]
  }

  getPageElements () {
    return this.pageElements
  }

  /**
   * 根据页面配置读取页面控制对象结构
   * @param {Element} el DOM 根元素
   */
  initialize () {
    this.id = this.pageConfig.id
    this.properties = this.pageConfig.properties
    this.pageVariableValues = {}

    for (const variablesConfig of this.pageConfig.variables || []) {
      if (trim(variablesConfig.name)) {
        this.pageVariableValues[trim(variablesConfig.name)] = pe(variablesConfig.value)
      }
    }

    this.pageElements = {}
    for (const element of this.pageConfig.elements) {
      const elementWrapper = new this.ElementWrapper({
        pageManager: this,
        config: element
      })
      this.pageElements[elementWrapper.id] = elementWrapper
    }
  }

  /**
   * 挂载整个页面到body或者根元素
   * @param {Element} el 根元素
   */
  async mount (el) {
    for (const wrapper of Object.values(this.pageElements).filter(e => e.isRoot())) {
      const div = document.createElement('div')
      wrapper.mount(div)
      el.appendChild(div)
    }
    el.style.width = this.properties.width + 'px'
    el.style.height = this.properties.height + 'px'
  }

  async unmount () {
    for (const wrapper of Object.values(this.pageElements).filter(e => e.isRoot())) {
      wrapper.unmount()
    }
  }

  async preload () {
    const awaitings = []
    for (const wrapper of this.pageElements) {
      awaitings.push(await wrapper.preload())
    }
    await Promise.allSettled(awaitings)
  }

  updatePageVariableValue (name, value) {
    this.pageVariableValues[name] = value
    this.forceUpdate()
  }

  /**
   * 整页按照变量和动态数据完全更新
   */
  forceUpdate () {
    for (const element of Object.values(this.pageElements)) {
      element.forceUpdateStyle()
      element.forceUpdate()
    }
  }

  getVariableValues () {
    return this.pageVariableValues
  }
}

export default PageElementManager
