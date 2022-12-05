import ElementWrapper from './ElementWrapper'
import { nanoid, trim } from '../utils/string'

class PageElementManager {
  constructor (ridge, el, id) {
    this.id = id
    this.ridge = ridge
    this.pageRootEl = el
    this.properties = {}
    this.pageVariableConfig = []
    this.pageVariableValues = {}
  }

  getPageProperties () {
    return this.properties
  }

  /**
   * 从组件定义片段创建一个页面元素实例
   * @param {Object} fraction 来自
   * @param {String} 组件ID/Path
   * @param {*} viewConfig 默认配置顺序
   * @returns
   */
  createElement (fraction) {
    try {
      const div = document.createElement('div')
      div.setAttribute('ridge-id', nanoid(10))
      div.setAttribute('component-path', fraction.componentPath)

      div.dataset.name = fraction.title
      div.dataset.config = JSON.stringify({
      })
      div.style.width = (fraction.width ?? 100) + 'px'
      div.style.height = (fraction.height ?? 100) + 'px'

      const elementWrapper = new ElementWrapper({
        el: div,
        page: this
      })
      return elementWrapper
    } catch (e) {
      console.error('Error Create Element', e)
      return null
    }
  }

  removeElements (elements) {
    for (const el of elements) {
      let target = el
      if (typeof target === 'string') {
        target = this.pageElements[target]
      }
      target.parentElement.removeChild(target)
    }
  }

  async initializeElement (el) {
    const elementWrapper = new ElementWrapper({
      el,
      page: this
    })
    await elementWrapper.initialize()
    return elementWrapper
  }

  /**
   * 根据页面配置(HTML DOM)初始化页面
   * @param {Element} el DOM 根元素
   */
  async initialize () {
    const pageConfigEl = this.pageRootEl.querySelector('#ridge-page-properties')

    this.properties = this.ridge.getElementConfig(pageConfigEl, 'properties') || {
      title: '页面',
      type: 'fixed',
      width: 800,
      height: 600
    }
    this.pageVariableConfig = this.ridge.getElementConfig(pageConfigEl, 'variables') || [{
      name: '变量',
      value: ''
    }]

    this.pageVariableConfig = this.pageVariableConfig.filter(n => n != null)
    const rootNodes = this.pageRootEl.querySelectorAll('div')

    const initializeRootElements = []
    for (const node of rootNodes) {
      initializeRootElements.push(await this.initializeElement(node))
    }

    await Promise.allSettled(initializeRootElements)
  }

  persistance () {
    const pageConfigEl = this.pageRootEl.querySelector('#ridge-page-properties')

    this.ridge.setElementConfig(pageConfigEl, 'properties', this.properties)
    this.ridge.setElementConfig(pageConfigEl, 'variables', this.pageVariableConfig)
  }

  updatePageVariableValue (name, value) {
    this.pageVariableValues[name] = value
    this.forceUpdate()
  }

  updateVariableConfig (variablesConfig) {
    this.pageVariableConfig = variablesConfig

    this.pageVariableValues = {}

    for (const pv of this.pageVariableConfig) {
      if (trim(pv.name)) {
        this.pageVariableValues[trim(pv.name)] = pv.value
      }
    }
    this.forceUpdate()
  }

  /**
   * 整页按照变量和动态数据完全更新
   */
  forceUpdate () {
    const elements = this.pageRootEl.querySelectorAll('div[ridge-id]')

    for (const el of elements) {
      el.elementWrapper.forceUpdate()
    }
  }

  getVariableValues () {
    return this.pageVariableValues
  }

  getVariableConfig () {
    return this.pageVariableConfig
  }
}

export default PageElementManager
