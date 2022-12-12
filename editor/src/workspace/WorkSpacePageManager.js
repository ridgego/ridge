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
