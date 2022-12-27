import ElementWrapper from './ElementWrapper'
import { trim, nanoid } from '../utils/string'
import { pe, st } from '../utils/expr'

class PageElementManager {
  constructor (pageConfig, ridge, wrapperClass) {
    this.pageConfig = pageConfig
    this.ridge = ridge
    this.ElementWrapper = wrapperClass || ElementWrapper
    this.initialize()
  }

  /**
   * 根据页面配置读取页面控制对象结构
   * @param {Element} el DOM 根元素
   */
  initialize () {
    this.id = this.pageConfig.id
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

  getPageProperties () {
    return this.pageConfig.properties
  }

  getVariableConfig () {
    return this.pageConfig.variables
  }

  getVariableValues () {
    return this.pageVariableValues
  }

  /**
   * 更新页面属性配置
   * @param {} properties
   */
  updatePageProperties (properties) {
    Object.assign(this.pageConfig.properties, properties)
    this.updateRootElStyle()
  }

  /**
   * 更新页面变量取值
   * @param {*} values 新的页面变量对
   */
  updatePageVariableValue (values) {
    Object.assign(this.pageVariableValues, values)
    this.updateVariableRelated(values)
  }

  /**
   * 更新页面变量配置
   * @param {*} name 名称
   * @param {*} value 变量值
   */
  updateVariableConfig (variablesConfig) {
    this.pageConfig.variables = variablesConfig

    this.pageVariableValues = {}

    for (const pv of this.pageConfig.variables) {
      if (trim(pv.name)) {
        this.pageVariableValues[trim(pv.name)] = pe(pv.value)
      }
    }
    this.forceUpdate()
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
    for (const wrapper of Object.values(this.pageElements).filter(e => e.isRoot())) {
      const div = document.createElement('div')
      wrapper.mount(div)
      el.appendChild(div)
    }
    this.el = el
    this.updateRootElStyle()
  }

  updateRootElStyle () {
    this.el.style.width = this.pageConfig.properties.width + 'px'
    this.el.style.height = this.pageConfig.properties.height + 'px'
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
   * 整页按照变量和动态数据完全更新
   */
  forceUpdate () {
    for (const element of Object.values(this.pageElements)) {
      element.forceUpdateStyle()
      element.forceUpdate()
    }
  }

  updateVariableRelated (variables) {
    const variableKeys = Object.keys(variables)
    for (const element of Object.values(this.pageElements)) {
      element.reactBy(variableKeys)
    }
  }

  setMode (mode) {
    for (const element of Object.values(this.pageElements)) {
      element.setMode(mode)
    }
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
        width: fraction.width ?? 100,
        height: fraction.height ?? 100
      },
      styleEx: {},
      props: {},
      propEx: {},
      events: []
    }

    const wrapper = new ElementWrapper({
      config: elementConfig,
      pageManager: this
    })
    wrapper.setMode('edit')
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
        this.removeElement(slotChild.element.id)
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
    const result = {
      properties: this.pageConfig.properties,
      variables: this.pageConfig.variables,
      elements: []
    }

    for (const element of Object.values(this.pageElements)) {
      result.elements.push(element.toJSON())
    }
    return result
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
