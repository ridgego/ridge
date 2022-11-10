import ElementWrapper from './ElementWrapper'

class PageElementManager {
  constructor (context) {
    this.context = context
    this.properties = {}
    this.pageVariableConfig = []
    this.pageElements = {}
  }

  getPageProperties () {
    return this.properties
  }

  /**
   * 从组件定义创建一个页面元素实例
   * @param {Element} el 创建在某个页面元素下
   * @param {String} 组件ID/Path
   * @param {*} viewConfig 默认配置顺序
   * @returns
   */
  async createElement (el, componentPath, componentConfig) {
    try {
      const div = document.createElement('div')
      el.appendChild(div)

      const elementWrapper = new ElementWrapper({
        el: div,
        componentPath,
        componentConfig,
        context: this.context
      })

      await elementWrapper.loadAndInitialize()

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
  }

  async initialize (el) {
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

    const rootNode = el.querySelectorAll('body>div')

    const initializeRootElements = []
    for (const node of rootNode) {
      initializeRootElements.push(await this.initializeElement(node))
    }

    await Promise.allSettled(initializeRootElements)
  }
}

export default PageElementManager
