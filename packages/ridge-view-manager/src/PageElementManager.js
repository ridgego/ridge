import ElementWrapper from './ElementWrapper'

class PageElementManager {
  constructor (context) {
    this.context = context
    this.pageElements = {}
  }

  /**
   * 从组件定义创建一个页面元素实例
   * @param {*} 组件全局ID
   * @param {*} el
   * @param {*} viewConfig 默认配置顺序
   * @returns
   */
  async createElement (componentPath, el, componentConfig) {
    try {
      const elementWrapper = new ElementWrapper({
        el,
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
}

export default PageElementManager
