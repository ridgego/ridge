import Renderer from './Renderer'

/**
 * 渲染Store 组件
 * @param el  html层
 */
export default class StoreRender extends Renderer {
  constructor (StoreComponent, initOption = {}) {
    super()
    this.StoreComponent = StoreComponent
    this.props = initOption
  }

  mount (el) {
    this.el = el
    this.el.innerHTML = `<div class="store-component"><i class="bi bi-sliders"></i><div class="title">${this.StoreComponent.title ?? this.StoreComponent.name}</div></div>`
  }

  update ({ title }) {
    this.el.innerHTML = `<div class="store-component"><i class="bi bi-sliders"></i><div class="title">${title}</div></div>`
  }
}
