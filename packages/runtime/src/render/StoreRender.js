import Renderer from './Renderer'

/**
 * 渲染Store 组件
 * @param el  html层
 */
export default class StoreRender extends Renderer {
  constructor (options) {
    super()
    this.options = options
  }

  mount (el) {
    this.el = el
    this.el.innerHTML = `<div class="store-component"><i class="bi bi-sliders"></i><div class="store-name">${this.options.title ?? this.options.name}</div></div>`
  }

  update ({ title }) {
    this.el.innerHTML = `<div class="store-component"><i class="bi bi-sliders"></i><div class="store-name">${title}</div></div>`
  }
}
