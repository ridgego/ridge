import ElementWrapper from './ElementWrapper'
import { nanoid, trim } from '../utils/string'
import { pe } from '../utils/expr'

class PageElementManager {
  constructor (pageConfig) {
    this.pageConfig = pageConfig
    this.initialize()
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
  initialize () {
    this.id = this.pageConfig.id
    this.properties = this.pageConfig.properties
    this.pageVariableConfig = this.pageConfig.variables
    this.pageVariableValues = {}

    for (const variablesConfig of this.pageVariableConfig) {
      if (trim(variablesConfig.name)) {
        this.pageVariableValues[trim(variablesConfig.name)] = pe(variablesConfig.value)
      }
    }

    this.rootElements = []
    for (const element of this.pageConfig.elements) {
      const elementWrapper = new ElementWrapper({
        pageManager: this,
        elementConfig: element
      })
      this.rootElements.push(elementWrapper)
    }
  }

  async mount (el) {
    for (const wrapper of this.rootElements) {
      const div = document.createElement('div')
      wrapper.mount(div)
      el.appendChild(div)
    }
    el.style.width = this.properties.width + 'px'
    el.style.height = this.properties.height + 'px'
  }

  async preload () {
    const awaitings = []
    for (const wrapper of this.rootElements) {
      awaitings.push(await wrapper.preload())
    }
    await Promise.allSettled(awaitings)
  }

  /**
   * 获取页面的定义信息
   * @returns JSON
   */
  getPageJSON () {
    const result = {
      id: this.id,
      properties: this.properties,
      variables: this.variablesConfig,
      elements: []
    }

    for (const element of this.rootElements) {
      result.elements.push(element.toJSON())
    }
    return result
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
        this.pageVariableValues[trim(pv.name)] = pe(pv.value)
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
