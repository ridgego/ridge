/* eslint-disable no-undef */
// import React from 'react';
// import ReactDOM from 'react-dom';
// 这里需要注释掉React、ReactDOM 否则此包会同外围编辑器等项目一起使用。而开发期间的图元的React是额外load的，会在
// React hook 使用时报错 因此，React一定要使用window全局的React对象
import Renderer from './Renderer';

const contextProviders = [
    // antd ConfigProvider 上下文
    (jsx) => {
        if (window.antd) {
            return React.createElement(window.antd.ConfigProvider, {
                prefixCls: (window.top.fdreConfig && window.top.fdreConfig.antdPrefixCls) || 'ant'
            }, [jsx]);
        } else {
            return jsx;
        }
    },
    ...(window.top.fdreConfig && window.top.fdreConfig.reactContextProviders) || []
];

/**
 * 渲染及React组件到图元层
 * @param JSXComponent  React组件实例
 * @param el  html层
 * @param initOption React初始化属性
 */
export default class ReactRenderer extends Renderer {
    constructor(JSXComponent, el, initOption = {}) {
        super();
        this.el = el;
        this.JSXComponent = JSXComponent;
        this.props = initOption;

        // 规范：ReactDOM的render方法会返回组件的ref （class组件），然而在最新ReactDOM描述中，ref不会立刻返回
        // ReactDOM.render() currently returns a reference to the root ReactComponent instance. However,
        // using this return value is legacy and should be avoided because future versions of React may render
        // components asynchronously in some cases. If you need a reference to the root ReactComponent instance,
        // the preferred solution is to attach a callback ref to the root element.
        // this.props.refCallback = ref => {
        //     this.renderRef = ref;
        // };
        if (!this.props.ref) {
            this.props.ref = React.createRef();
        }
        this.renderRef = this.props.ref;
        ReactDOM.render(this.getRenderInstance(), el);
    }

    getRenderInstance() {
        let reactInstance = React.createElement(this.JSXComponent, this.props);

        for (let i = 0; i < contextProviders.length; i++) {
            reactInstance = contextProviders[i](reactInstance);
        }
        return reactInstance;
    }

    /**
   * 捕获组件向外触发的时间
   * @param {Event} event 事件
   * @param {Function} callback 回调函数
   * @override
   */
    on(event, callback) {
        Object.assign(this.props, {
            [event]: callback
        });
        ReactDOM.render(React.createElement(this.JSXComponent, this.props), this.el);
    }

    /**
   * 进行渲染器方法调用（MVVM情况下大多数不推荐）
   * @param {String} method 方法名称
   * @param {Array} args 参数数组
   */
    invoke(method, args) {
        // 只有类组件才能调用方法
        // Render a React element into the DOM in the supplied container and
        // return a reference to the component (or returns null for stateless components).
        if (this.renderRef && this.renderRef.current && this.renderRef.current[method] && typeof this.renderRef.current[method] === 'function') {
            return this.renderRef.current[method](...(args || []));
        } else {
            console.error('无法调用无状态组件的方法!');
            return null;
        }
    }

    /**
   * 更新属性，使渲染器重新渲染
   * React的虚拟DOM机制使得React的组件重新render到具体element时会只更新变化的DOM
   * @param option
   * @override
   */
    setOption(option) {
        this.updateProps(option);
    }

    /**
   * 更新属性，使渲染器重新渲染
   * React的虚拟DOM机制使得React的组件重新render到具体element时会只更新变化的DOM
   * @param option
   */
    updateProps(props) {
        // 方法说明： If the React element was previously rendered into container,
        // this will perform an update on it and only mutate the DOM as necessary to reflect the latest React element.
        Object.assign(this.props, props);

        if (this.renderRef && this.renderRef.current && typeof this.renderRef.current.updateProps === 'function') {
            this.renderRef.current.updateProps(props);
        } else {
            ReactDOM.render(this.getRenderInstance(), this.el);
        }
    }

    /**
   * 重新布局， 响应渲染元素移动、大小调整等情况
   * React的虚拟DOM机制使得React的组件重新render到具体element时会只更新变化的DOM
   * @param option
   */
    layout(option) {
        ReactDOM.render(React.createElement(this.JSXComponent, option), this.el);
    }

    /**
   * 渲染销毁
   */
    destroy() {
    /**
     * ReactDOM 方法说明
     * Remove a mounted React component from the DOM and clean up its event handlers and state.
     * If no component was mounted in the container, calling this function does nothing.
     * Returns true if a component was unmounted and false if there was no component to unmount.
     */
        ReactDOM.unmountComponentAtNode(this.el);
        if (this.renderRef) {
            this.renderRef = null;
        }
    }
}
