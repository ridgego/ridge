import Renderer from './Renderer'

/**
 * 渲染VannilaJS 组件
 * @param el  html层
 * @param initOption React初始化属性
 */
export default class VanillaRender extends Renderer {
  constructor (VannilaComponent, el, initOption = {}) {
    super()
    this.el = el
    this.VannilaComponent = VannilaComponent
    this.props = initOption

    this.getRenderInstance().mount(el)
  }

  getRenderInstance () {
    if (!this.instance) {
      this.instance = new this.VannilaComponent(this.props)
    }
    return this.instance
  }

  /**
   * 捕获组件向外触发的时间
   * @param {Event} event 事件
   * @param {Function} callback 回调函数
   * @override
   */
  on (event, callback) {
    this.instance.on(event, callback)
  }

  /**
   * 进行渲染器方法调用（MVVM情况下大多数不推荐）
   * @param {String} method 方法名称
   * @param {Array} args 参数数组
   */
  invoke (method, args) {
    if (this.getRenderInstance()[method]) {
      return this.getRenderInstance()[method].apply(this.getRenderInstance(), args)
    }
  }

  setOption (option) {
    this.updateProps(option)
  }

  /**
   * 更新属性，使渲染器重新渲染
   * @param option
   */
  updateProps (props) {
    this.getRenderInstance().update(props)
  }

  /**
   * 重新布局， 响应渲染元素移动、大小调整等情况
   * @param option
   */
  layout (option) {
    this.getRenderInstance().layout(option)
  }

  /**
   * 渲染销毁
   */
  destroy () {
    if (this.instance) {
      this.instance.destroy && this.instance.destroy()
      this.instance = null
    }
  }
}
