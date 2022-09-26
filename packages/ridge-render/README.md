## 前端渲染器

Renderer
页面渲染抽象类，提供界面渲染、数据获取等方面操作的统一接口

ReactRenderer
默认React UI组件渲染封

VueRenderer
默认React UI组件渲染封

![类结构图](http://10.10.247.1:4877/api/packages/@gw/fc-render/latest/pel-render.png)

## 安装
```
npm i @gw/fc-render
```

## 前端组件 (FC  Front Component)
在组态页面中能被单独引入、配置的节点单元成为图元。
图元可能是一个指标呈现、信息列表、功率曲线图、地图、3D展示或者是图片、背景或修饰线。在基于ht的升压站接线图组态应用中，大部分图元都是由ht的基本绘图元素组合而成。
而在大屏组态中，基于页面丰富性、扩展性、开放性及可交互性等方面考虑，大部分图元将使用Web标准前端技术来构建。我们之前构建大屏或者普通页面，页面都是由开发人员直接开发、输出及部署的，使用的页面开发技术包括了React、Vue及JQuery等（未来的项目会规划全部基于React技术栈），而在大屏组态中，开发人员只提供页面元素，页面布局、发布及部署都是由实施人员执行。因此，有必要将之前技术栈开发的UI组件转换为可为大屏使用的图元，另外新的UI组件开发也要考虑能够快速的进行图元转换。

## 图元渲染

图元必须通过渲染器才能呈现在页面上。大部分情况下通过图元配置renderer即可 （默认是自动检测的） 对于非vue、react图元则必须给出图元工厂

## 图元举例
例如我们有以下react开发的组件
```javascript
// Hello.jsx
export default ({message, React}) => {
  return <div>
    {'Hello ' + message}
  </div>
}
// 对于非函数式组件写法 需要import React
```

要将其封装为图元，需要增加一个配置文件
```javascript
import ReactPelFactory from '../src/factory/ReactPelFactory'
import HelloJSX from './Hello.jsx'
export default {
  // 标题，用于显示组件名称。 不填不影响使用
  title: 'React测试组件',
  // 属性配置
  props: {
    // 默认值  如果组件未提供可以在这里补齐。
    defaultValue: {
      message: 'React',
      color: 'green'
    }
  },
  events: ['click'],
  // 也可以写为 renderer:  HelloJSX， 这种写法loader会根据renderer类型使用对应的factory封装
  factory: new ReactPelFactory(HelloJSX)
}

```

## 自定义渲染器

如果使用其他技术开发的组件 （例如基于canvas或者3D引擎构建的组件），本身不依赖于vue或react技术，可以自开发渲染器，在图元属性renderer配置时选定自定义渲染器即可

自定义渲染器需要实现PelFactory及Renderer 这2个接口，接口分别定义如下:

```javascript
/**
 * 图元渲染抽象工厂，用来加载通用资源，提供节点渲染器
 */
export default class PelFactory {
  /**
   * 加载渲染引擎所必须的通用依赖
   * @returns 依赖的库名
   */
  async loadDependencies () {
  }
  /**
   * mount并初始化一个节点
   * @param {HTMLElement} htmlView 给定的目标渲染元素
   * @param {Object} initOption  初始化参数
   * @returns {Renderer} 节点渲染器
   */
  mount (htmlView, initOption) {
  }
}
```



```javascript
/**
 * 页面渲染抽象类，提供界面渲染、数据获取等方面操作的统一接口
 */
export default class Renderer {
  /**
   * 更新属性，使渲染器重新渲染
   * @param option
   */
  setOption (option) {}

  /**
   * 重新布局， 响应渲染元素移动、大小调整等情况
   * @param option
   */
  layout (option) {}

  /**
   * 进行渲染器方法调用（MVVM情况下大多数不推荐）
   * @param {String} method 方法名称
   * @param {Array} args 参数数组
   */
  invoke (method, args) {}

  /**
   * 捕获组件向外触发的时间
   * @param {Event} event 事件
   * @param {Function} callback 回调函数
   */
  on (event, callback) {}

  /**
   * 渲染销毁
   */
  destroy () {}
}
```

### 自定义渲染器样例


```javascript
import PelFactory from './PelFactory'
import ReactRenderer from '../renderer/ReactRenderer'
/**
 * React类型图元实例构建工厂
 */
export default class ReactPelFactory extends PelFactory {
  constructor (JSXComponent) {
    super()
    this.JSXComponent = JSXComponent
  }

  /**
   * 加载渲染引擎所必须的通用依赖  ReactDOM 及 React
   * @returns {Promise<void>}
   */
  async loadDependencies () { }
  /**
   * mount并初始化一个节点
   * @param {HTMLElement} htmlView
   * @param initOption
   * @returns {VueRenderer}
   */
  mount (htmlView, initOption) {
    htmlView.innerHTML = ''
    const div = document.createElement('div')
    div.style.width = '100%'
    div.style.height = '100%'
    htmlView.appendChild(div)
    const renderer = new ReactRenderer(this.JSXComponent, div, initOption)
    return renderer
  }
}

```

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import Renderer from './Renderer'

/**
 * 渲染及React组件到图元层
 * @param JSXComponent  React组件实例
 * @param el  html层
 * @param initOption React初始化属性
 */
export default class ReactRenderer extends Renderer {
  constructor (JSXComponent, el, initOption = {}) {
    super()
    this.el = el
    this.JSXComponent = JSXComponent
    this.initOption = initOption
    this.renderRef = ReactDOM.render(React.createElement(JSXComponent, initOption), el)
  }

 /**
   * 捕获组件向外触发的时间
   * @param {Event} event 事件
   * @param {Function} callback 回调函数
   * @override
   */
  on (event, callback) {
    Object.assign(this.initOption, {
      [event]: callback
    })
    this.renderRef = ReactDOM.render(React.createElement(this.JSXComponent, this.initOption), this.el)
  }

  /**
   * 进行渲染器方法调用（MVVM情况下大多数不推荐）
   * @param {String} method 方法名称
   * @param {Array} args 参数数组
   */
  invoke (method, args) {
    this.renderRef.apply(this.renderRef, method, args)
  }

  /**
   * 更新属性，使渲染器重新渲染
   * React的虚拟DOM机制使得React的组件重新render到具体element时会只更新变化的DOM
   * @param option
   * @override
   */
  setOption (option) {
    // 方法说明： If the React element was previously rendered into container,
    // this will perform an update on it and only mutate the DOM as necessary to reflect the latest React element.
    this.renderRef = ReactDOM.render(React.createElement(this.JSXComponent, option), this.el)
  }

  /**
   * 重新布局， 响应渲染元素移动、大小调整等情况
   * React的虚拟DOM机制使得React的组件重新render到具体element时会只更新变化的DOM
   * @param option
   */
  layout (option) {
    this.renderRef = ReactDOM.render(React.createElement(this.JSXComponent, option), this.el)
  }

   /**
   * 渲染销毁
   */
  destroy () {
    /**
     * ReactDOM 方法说明
     * Remove a mounted React component from the DOM and clean up its event handlers and state.
     * If no component was mounted in the container, calling this function does nothing.
     * Returns true if a component was unmounted and false if there was no component to unmount.
     */
    ReactDOM.unmountComponentAtNode(this.el)
  }
}

```
