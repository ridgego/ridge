/**
 * 页面渲染抽象类，提供界面渲染、数据获取等方面操作的统一接口
 */
export default class Renderer {
  /**
   * 更新属性，使渲染器重新渲染
   * @param option
   * @deprecated 改为updateProps
   */
  setOption (option) {}

  /**
   * 更新属性，使渲染器重新渲染
   * @param option
   */
  updateProps (props) {}

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
