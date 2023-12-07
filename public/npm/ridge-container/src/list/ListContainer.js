import BaseContainer from '../BaseContainer.js'

export default class ListContainer extends BaseContainer {
  async mounted () {
    if (this.isRuntime) {
      // this.forceUpdateChildren = false
      // 取消模板的挂载
      this.unmountChildren()
      if (this.children.length >= 1) {
        this.itemTemplate = this.children[0]
        this.renderUpdateListItems()
      }
    } else {
      if (this.children.length > 1) {
      }
    }
  }

  getContainerStyle () {
    const {
      border,
      padding
    } = this.props
    const containerStyle = {
      border,
      padding: padding + 'px',
      boxSizing: 'border-box'
    }
    return containerStyle
  }

  isDroppable () {
    const el = this.containerEl.querySelector(':scope > .ridge-element')
    if (el) {
      return false
    } else {
      return true
    }
  }

  updated () {
    if (this.isRuntime) {
      this.renderUpdateListItems()
    }
  }

  /**
   * 运行期间更新渲染列表
   */
  renderUpdateListItems () {
    const { dataSource } = this.props
    if (dataSource && this.itemTemplate) {
      if (this.items == null) {
        this.items = []
      }
      for (let index = 0; index < dataSource.length; index++) {
        const data = dataSource[index]
        if (this.items[index] == null) {
          const newEl = document.createElement('div')
          const itemComponent = this.itemTemplate.clone()
          itemComponent.setScopedData({
            i: index,
            list: dataSource,
            item: data
          })
          itemComponent.mount(newEl)
          this.items[index] = itemComponent
          this.containerEl.appendChild(newEl)
        } else {
          this.items[index].setScopedData({
            i: index,
            list: dataSource,
            item: data
          })
          this.items[index].forceUpdate()
        }
      }

      while (this.items.length > dataSource.length) {
        const pop = this.items.pop()
        pop.unmount()
      }
    }
  }

  getChildStyle (view) {
    const style = this.getResetStyle()
    const configStyle = view.config.style

    style.width = configStyle.width ? (configStyle.width + 'px') : ''
    style.height = configStyle.height ? (configStyle.height + 'px') : ''
    return style
  }
}
