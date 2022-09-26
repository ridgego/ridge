import Renderer from './Renderer';
import Vue from 'vue';

/**
 * 渲染及Vue组件到图元层
 * @param VueComponent  Vue组件实例
 * @param el  html层
 * @param initOption Vue初始化属性
 */
export default class VueRenderer extends Renderer {
    constructor(VueComponent, el, initOption) {
        super();
        this.vi = new Vue(VueComponent);
        Object.assign(this.vi.$props, initOption);
        this.vi.$mount(el);
    }

    /**
   * @param {@} option
   * @override
   */
    setOption(option) {
        Object.assign(this.vi.$props, option);
    }

    /**
   * 进行渲染器方法调用（MVVM情况下大多数不推荐）
   * @param {String} method 方法名称
   * @param {Array} args 参数数组
   * @override
   */
    invoke(method, args) {
        this.vi[method] && this.vi[method].apply(this.vi, args);
    }

    /**
   * 定义处理renderer触发变更后的回调
   * @param event
   * @param callback
   */
    on(event, callback) {
        this.vi.$on(event, callback);
    }

    layout() {
        this.vi.$forceUpdate();
    }

    destroy() {
        this.vi.$destroy();
    }
}
