import ElementWrapper from './ElementWrapper'
import { trim, nanoid } from '../utils/string'
import { pe, st } from '../utils/expr'
import Store from '../store/Store'

class PageElementManager {
  constructor (pageConfig, ridge, reactive) {
    this.pageConfig = pageConfig
    this.ridge = ridge
    this.decorators = {}
    this.reactive = reactive
    this.mounted = []
    this.initialize()
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

    if (this.reactive) {
      this.pageStore = new Store(this.pageConfig)
    } else {
      this.pageStore = new Store({ states: [], reducers: [] })
    }

    this.pageElements = {}
    for (const element of this.pageConfig.elements) {
      const elementWrapper = new ElementWrapper({
        pageManager: this,
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
      promises.push(await wrapper.mount(div))
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
      config: elementConfig,
      pageManager: this
    })
    this.pageElements[wrapper.id] = wrapper
    return wrapper
  }

  /**
   * 移出一个元素（递归进行）
   * @param {*} id
   */
  removeElement (id) {
    const element = this.pageElements[id]

    if (element) {
      for (const childId of element.getChildrenIds()) {
        this.removeElement(childId)
      }
      for (const slotChild of element.getSlotChildren()) {
        if (slotChild.element) {
          this.removeElement(slotChild.element.id)
        }
      }
      if (element.config.parent) {
        this.detachChildElement(this.pageElements[element.config.parent], id)
      }
      element.unmount()
      delete this.pageElements[id]
    }
  }

  /**
     * 当子节点从父节点移出后，（包括SLOT）重新更新父节点配置
     * @param {*} sourceParentElement 父节点
     * @param {*} childElementId 子节点
     */
  detachChildElement (sourceParentElement, childElement) {
    let isSlot = false
    for (const slotProp of sourceParentElement.componentDefinition.props.filter(prop => prop.type === 'slot')) {
      if (sourceParentElement.config.props[slotProp.name] === childElement) {
        sourceParentElement.setPropsConfig(null, {
          ['props.' + slotProp.name]: null
        })
        isSlot = true
      }
    }
    if (!isSlot) {
      sourceParentElement.config.props.children = sourceParentElement.invoke('getChildren')
    }
  }

  /**
   * 节点设置新的父节点
   * @param {*} targetParentElement
   * @param {*} sourceElement
   * @param {*} targetEl
   */
  attachToParent (targetParentElement, sourceElement, slotName) {
    if (slotName) { // 放置到slot中
      // 设置slot属性值为组件id
      // 父组件需要执行DOM操作
      targetParentElement.setPropsConfig(null, {
        ['props.' + slotName]: sourceElement
      })
    } else {
      // 这里容器会提供 appendChild 方法，并提供放置位置
      targetParentElement.invoke('appendChild', [sourceElement])
      targetParentElement.config.props.children = targetParentElement.invoke('getChildren')
    }
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

  /**
     * 从当前页面变量实例值复原
     */
  updateVariableConfigFromValue () {
    for (const pv of this.pageConfig.variables) {
      if (this.pageConfig.variables[trim(pv.name)]) {
        pv.value = st(this.pageConfig.variables[trim(pv.name)])
      }
    }
  }
}

export default PageElementManager
