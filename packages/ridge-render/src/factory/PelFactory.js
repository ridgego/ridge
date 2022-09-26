/**
 * 图元渲染抽象工厂，用来加载通用资源，提供节点渲染器
 */
export default class PelFactory {
    /**
   * 加载渲染引擎所必须的通用依赖
   * @returns 依赖的库名
   */
    async loadDependencies() {
    }

    /**
   * mount并初始化一个节点
   * @param {HTMLElement} htmlView 给定的目标渲染元素
   * @param {Object} initOption  初始化参数
   * @returns {Renderer} 节点渲染器
   */
    mount(htmlView, initOption) {
    }
}
