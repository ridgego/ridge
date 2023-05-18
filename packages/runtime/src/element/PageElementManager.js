import ElementWrapper from './ElementWrapper'
import { nanoid } from '../utils/string'
import Store from '../store/Store'

class PageElementManager {
  constructor (pageConfig, ridge, mode) {
    this.pageConfig = pageConfig
    this.ridge = ridge
    this.mode = mode
    this.decorators = {}
    this.mounted = []
    this.initialize()
  }

  setMode (mode) {
    this.mode = mode
  }

  /**
   * 根据页面配置读取页面控制对象结构
   * @param {Element} el DOM 根元素
   */
  initialize () {
    this.id = this.pageConfig.id

    if (!this.pageConfig.states) {
      this.pageConfig.states = []
    }
    if (!this.pageConfig.reducers) {
      this.pageConfig.reducers = []
    }

    if (this.mode === 'run') {
      this.pageStore = new Store(this.pageConfig)
    }

    this.pageElements = {}
    for (const element of this.pageConfig.elements) {
      const elementWrapper = new ElementWrapper({
        pageManager: this,
        mode: this.mode,
        config: element
      })
      this.pageElements[elementWrapper.id] = elementWrapper
    }
  }

  getPageProperties () {
    return this.pageConfig.properties
  }

  /**
   * 更新页面属性配置
   * @param {} properties
   */
  updatePageProperties (properties) {
    this.pageConfig.properties = properties
    this.updateRootElStyle()
  }

  /**
   * 更新页面变量取值
   * @param {*} values 新的页面变量对
   */
  updatePageConfig (change) {
    Object.assign(this.pageConfig, change)
    this.updateRootElStyle()
  }

  getElement (id) {
    return this.pageElements[id]
  }

  getPageElements () {
    return this.pageElements
  }

  /**
   * 挂载整个页面到body或者根元素
   * @param {Element} el 根元素
   */
  async mount (el) {
    this.el = el
    this.updateRootElStyle()

    const promises = []
    for (const wrapper of Object.values(this.pageElements).filter(e => e.isRoot())) {
      const div = document.createElement('div')
      el.appendChild(div)
      promises.push(await wrapper.loadAndMount(div))
    }
    this.onPageMounted && this.onPageMounted()
    await Promise.allSettled(promises)
    this.onPageLoaded && this.onPageLoaded()
  }

  // 配置根节点容器的样式 （可能是body）
  updateRootElStyle () {
    if (this.pageConfig.properties.background) {
      this.el.style.background = this.pageConfig.properties.background
    } else {
      this.el.style.background = ''
    }

    if (this.mode === 'edit') {
      this.el.style.width = this.pageConfig.properties.width + 'px'
      this.el.style.height = this.pageConfig.properties.height + 'px'
    } else {
      switch (this.pageConfig.properties.type) {
        case 'static':
          this.el.style.width = this.pageConfig.properties.width + 'px'
          this.el.style.height = this.pageConfig.properties.height + 'px'
          break
        case 'responsive':
          this.el.style.width = '100%'
          this.el.style.height = '100%'
          this.el.style.overflowY = 'auto'
          break
        case 'full-responsive':
          this.el.style.width = '100%'
          this.el.style.height = 'auto'
          break
      }
    }
  }

  /**
   * 整页按照变量和动态数据完全更新
   */
  forceUpdate () {
    for (const element of Object.values(this.pageElements)) {
      element.forceUpdate()
    }
  }

  async unmount () {
    for (const wrapper of Object.values(this.pageElements).filter(e => e.isRoot())) {
      wrapper.unmount()
    }
    if (this.mode === 'edit') {
      this.el.style.width = 0
      this.el.style.height = 0
    }
  }

  /**
   * 预加载及初始化页面内的元素
   */
  async preload () {
    const awaitings = []
    for (const wrapper of this.pageElements) {
      awaitings.push(await wrapper.preload())
    }
    await Promise.allSettled(awaitings)
  }

  /**
 * 从组件定义片段创建一个页面元素实例
 * @param {Object} fraction 来自
 * @returns
 */
  createElement (fraction) {
    // 生成组件定义
    const elementConfig = {
      title: fraction.title,
      id: nanoid(5),
      isNew: true,
      path: fraction.componentPath,
      style: {
        position: 'absolute',
        visible: true,
        width: fraction.width ?? 100,
        height: fraction.height ?? 100
      },
      styleEx: {},
      props: {},
      propEx: {},
      events: {}
    }

    const wrapper = new ElementWrapper({
      isCreate: true,
      mode: this.mode,
      config: elementConfig,
      pageManager: this
    })
    this.pageElements[wrapper.id] = wrapper
    return wrapper
  }

  /**
   * 复制一个节点（包括节点下的子节点）
   * @param {ElementWrapper} sourceWrapper
   * @returns
   */
  cloneElementWithChild (sourceWrapper) {
    const newWrapper = sourceWrapper.clone()
    console.log('mounted', newWrapper, newWrapper.config.style)

    const div = document.createElement('div')
    newWrapper.mount(div)

    this.pushElement(newWrapper)
    return newWrapper
  }

  pushElement (wrapper) {
    this.pageElements[wrapper.id] = wrapper
  }

  /**
   * 移出一个元素（递归进行）
   * @param {*} id
   */
  removeElement (id) {
    const element = this.pageElements[id]

    if (element) {
      if (element.parentWrapper) {
        this.detachChildElement(element, true)
      }

      element.forEachChildren((childWrapper, type, propKey) => {
        this.removeElement(childWrapper.id)
      })
      element.unmount()
      delete this.pageElements[id]
    }
  }

  /**
     * 当子节点从父节点移出后，（包括SLOT）重新更新父节点配置
     * @param {*} sourceParentElement 父节点
     * @param {*} childElementId 子节点
     */
  detachChildElement (childElement, isDelete) {
    const sourceParentElement = childElement.parentWrapper

    const result = sourceParentElement.invoke('removeChild', [childElement, isDelete])
    Object.assign(sourceParentElement.config.props, result)

    delete childElement.config.parent
    delete childElement.parentWrapper
  }

  /**
   * 节点设置新的父节点
   * @param {*} targetParentElement
   * @param {*} sourceElement
   * @param {*} targetEl
   */
  attachToParent (targetParentElement, sourceElement, pos = {}) {
    if (!targetParentElement.hasMethod('appendChild')) {
      return false
    }
    // 这里容器会提供 appendChild 方法，并提供放置位置
    const result = targetParentElement.invoke('appendChild', [sourceElement, pos.x, pos.y])

    if (result === false) {
      return false
    } else {
      Object.assign(targetParentElement.config.props, result)

      sourceElement.config.parent = targetParentElement.id
      sourceElement.parentWrapper = targetParentElement
    }
  }

  putElementToRoot (element) {
    const div = document.createElement('div')
    this.el.appendChild(div)
    element.mount(div)
    return element
  }

  /**
     * 获取页面的定义信息
     * @returns JSON
     */
  getPageJSON () {
    this.pageConfig.elements = []
    for (const element of Object.values(this.pageElements)) {
      this.pageConfig.elements.push(element.toJSON())
    }
    return this.pageConfig
  }

  addDecorators (type, decorator) {
    if (!this.decorators[type]) {
      this.decorators[type] = []
    }
    this.decorators[type].push(decorator)
  }
}

export default PageElementManager
