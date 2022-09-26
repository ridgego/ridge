/*
 * @Author: 刘晗
 */
/**
 * 页面 装饰类基类：全局实现某些控制、对fcViewManager做整体控制拦截
 */
export default class PageDecorator {
    /**
     * ViewManager 初始化回调
     */
    async init() {}
    /**
     * ViewManager 上下文更新处理事件
     * @param {*} context 上下文内容
     * @param {*} apolloApp app
     */
    contextUpdate(context, apolloApp) {}
    /**
     * page实例mount后触发事件
     * @param {*} fcViewManager
     */
    async onPageViewsCreated(components, opts) {}
}
