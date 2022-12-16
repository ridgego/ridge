import { PageElementManager } from 'ridge-runtime'
import { pe } from 'ridge-runtime/src/utils/expr'
import { nanoid, trim } from '../utils/string'
import EditorElementWrapper from './EditorElementWrapper'

export default class WorkSpacePageManager extends PageElementManager {
  constructor (pageConfig, ridge) {
    super(pageConfig, ridge, EditorElementWrapper)
    this.pageVariableConfig = this.pageConfig.variables || []
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

    const wrapper = new EditorElementWrapper({
      config: elementConfig,
      pageManager: this
    })
    this.pageElements[wrapper.id] = wrapper
    return wrapper
  }

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
   * @param {*} childElementId 子节点id
   */
  detachChildElement (sourceParentElement, childElementId) {
    let isSlot = false
    for (const slotProp of sourceParentElement.componentDefinition.props.filter(prop => prop.type === 'slot')) {
      if (sourceParentElement.config.props[slotProp.name] === childElementId) {
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
        ['props.' + slotName]: sourceElement.id
      })
    } else {
      // 这里容器会提供 appendChild 方法，并提供放置位置
      targetParentElement.invoke('appendChild', [sourceElement.el])
      targetParentElement.config.props.children = targetParentElement.invoke('getChildren')
    }
  }

  /**
   * 获取页面的定义信息
   * @returns JSON
   */
  getPageJSON () {
    const result = {
      id: this.id,
      properties: this.properties,
      variables: this.pageVariableConfig,
      elements: []
    }

    for (const element of Object.values(this.pageElements)) {
      result.elements.push(element.toJSON())
    }
    return result
  }

  updatePageProperties (properties) {
    this.properties = properties
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

  getVariableConfig () {
    return this.pageVariableConfig
  }
}
