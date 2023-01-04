/**
 * 对Element变化过程进行介入及修改
 */
export default class ElementDecorator {
  /**
      * view的组件代码加载完成事件 (注意此时组件只加载完成定义信息，还未初始化属性、交互及挂载)
      * @param {*} fcViewInstance 组件实例
      * @param {} componentDefinition 组件定义信息 （fcp）
      */
  loaded (fcViewInstance, componentDefinition) {}
  /**
     * 组件初始化属性后触发
     * @param {FCView} fcViewInstance
     */
  initPropEvents (fcViewInstance) {}
  /**
     * view实例mount后触发事件
     * @param {*} fcViewInstance
     */
  mounted (fcViewInstance) {}

  /**
     * 更新属性触发
     * @param {*} fcViewInstance
     */
  updateProps (wrapper, {
    configProps,
    systemProps,
    props
  }) {}

  /**
     * 销毁触发
     * @param {*} fcViewInstance
     */
  unmount (fcViewInstance) {}
}
