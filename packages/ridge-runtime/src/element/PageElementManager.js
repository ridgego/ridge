import ElementWrapper from './ElementWrapper'
import { nanoid } from '../utils/string'

class PageElementManager {
  constructor (ridge) {
    this.ridge = ridge
    this.context = {}
    this.properties = {}
    this.pageVariableConfig = []
    this.pageElements = {}
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
      div.dataset.name = fraction.name
      div.style.position = 'absolute'
      div.style.width = (fraction.width ?? 100) + 'px'
      div.style.height = (fraction.height ?? 100) + 'px'

      const elementWrapper = new ElementWrapper({
        el: div,
        page: this
      })
      this.pageElements[elementWrapper.id] = elementWrapper
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
      const id = target.elementWrapper.id
      delete this.pageElements[id]
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
  async initialize (el) {
    this.pageRootEl = el
    const pageConfig = el.querySelector('[id="ridge-page-config"]')

    for (const opt of pageConfig.children) {
      this.properties[opt.getAttribute('key')] = opt.getAttribute('value')
    }

    const pageVariable = el.querySelector('[id="ridge-page-variables"]')

    for (const opt of pageVariable.children) {
      const v = {
        name: opt.getAttribute('key'),
        type: opt.getAttribute('type'),
        value: opt.getAttribute('value')
      }
      this.pageVariableConfig.push(v)
    }

    this.context.pageProperties = this.properties

    const rootNode = el.querySelectorAll('div')

    const initializeRootElements = []
    for (const node of rootNode) {
      initializeRootElements.push(await this.initializeElement(node))
    }

    await Promise.allSettled(initializeRootElements)
  }
}

export default PageElementManager
