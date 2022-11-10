import ElementWrapper from './ElementWrapper'

class PageElementManager {
  constructor (context) {
    this.context = context
    this.pageElements = {}
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

  async load (el, html) {
    const creatings = []
    const container = document.createElement('div')
    container.innerHTML = html

    const rootNode = container.querySelectorAll('body>div')

    for (const node of nodes) {
      creatings.push(await this.createElement(el, node.componentPath, node.componentConfig))
    }

    await Promise.allSettled(creatings)
  }
}

export default PageElementManager
