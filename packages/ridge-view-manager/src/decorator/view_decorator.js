/**
 * ViewDecorator FcView装饰类基类
 * 对FcView变化过程进行介入及修改
 */
export default class ViewDecorator {
    /**
     * 组件初始化属性后触发
     * @param {FCView} fcViewInstance
     */
    initPropEvents(fcViewInstance) {}
    /**
     * view的组件代码加载完成事件 (注意此时组件只加载完成定义信息，还未初始化属性、交互及挂载)
     * @param {*} fcViewInstance 组件实例
     * @param {} componentDefinition 组件定义信息 （fcp）
     */
    loaded(fcViewInstance, componentDefinition) {}
    /**
     * view实例mount后触发事件
     * @param {*} fcViewInstance
     */
    mounted(fcViewInstance) {}

    /**
     * 更新属性触发
     * @param {*} fcViewInstance
     */
    updateProps(fcViewInstance) {}
    /**
     * 销毁触发
     * @param {*} fcViewInstance
     */
    unmount(fcViewInstance) {}
}
