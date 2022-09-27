/**
 * Vue类型图元实例构建工厂
 */
import PelFactory from './PelFactory'
import VueRenderer from '../renderer/VueRenderer'

export default class VuePelFactory extends PelFactory {
  constructor (VueComponent) {
    super()
    this.VueComponent = VueComponent
  }

  /**
   * 加载渲染引擎所必须的通用依赖  Vue
   * @returns {Promise<void>}
   */
  async loadDependencies () {
  }

  /**
   * mount并初始化一个节点
   * @param {HTMLElement} htmlView
   * @param initOption
   * @returns {VueRenderer}
   */
  mount (htmlView, initOption) {
    const div = document.createElement('div')

    htmlView.innerHTML = ''
    htmlView.appendChild(div)
    const renderer = new VueRenderer(this.VueComponent, div, initOption)

    return renderer
  }
}
