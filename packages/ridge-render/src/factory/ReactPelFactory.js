import PelFactory from './PelFactory';
import ReactRenderer from '../renderer/ReactRenderer';
/**
 * React类型图元实例构建工厂
 */
export default class ReactPelFactory extends PelFactory {
    constructor(JSXComponent) {
        super();
        this.JSXComponent = JSXComponent;
    }

    /**
   * 加载渲染引擎所必须的通用依赖  ReactDOM 及 React
   * @returns {Promise<void>}
   */
    async loadDependencies() { }
    /**
   * mount并初始化一个节点
   * @param {HTMLElement} htmlView
   * @param initOption
   * @returns {VueRenderer}
   */
    mount(htmlView, initOption, context) {
        // htmlView.innerHTML = '';
        // const div = document.createElement('div');

        // div.style.width = '100%';
        // div.style.height = '100%';
        // htmlView.appendChild(div);
        const renderer = new ReactRenderer(this.JSXComponent, htmlView, initOption, context);

        return renderer;
    }
}
