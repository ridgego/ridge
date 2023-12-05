import BaseContainer from '../BaseContainer.js'

export default class ListContainer extends BaseContainer {
  async mounted () {
    if (this.isRuntime) {
      this.forceUpdateChildren = false
      this.unmountChildren()
      this.renderUpdateListItems()
      this.itemTemplate = this.children[0]
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
    const { itemKey, dataSource } = this.props
    if (dataSource && this.itemTemplate) {
      for (let index = 0; index < dataSource.length; index++) {
        const data = dataSource[index]
        // 先找到是否有之前的dom
        let existedEl = this.containerEl.children[index]
        if (itemKey) {
          existedEl = this.containerEl.querySelector('div[key="' + data[itemKey] + '"]')
        }
        if (existedEl) {
          if (existedEl !== this.containerEl.children[index]) {
            this.containerEl.insertBefore(existedEl, this.containerEl.children[index])
          }
          const ridgeNode = existedEl.ridgeNode

          // 更新属性后强制更新
          // wrapper.listIndex = index
          ridgeNode.setScopedData({
            i: index,
            list: dataSource,
            item: data
          })
          ridgeNode.forceUpdate()
        } else {
          const newEl = document.createElement('div')
          if (itemKey) {
            newEl.setAttribute('key', data[itemKey])
          }
          if (this.containerEl.children[index]) {
            this.containerEl.insertBefore(newEl, this.containerEl.children[index])
          } else {
            this.containerEl.appendChild(newEl)
          }
          const itemComponent = this.itemTemplate.clone()
          itemComponent.setScopedData({
            i: index,
            list: dataSource,
            item: data
          })
          itemComponent.mount(newEl)
        }
      }

      // 删除多出的项目
      while (this.containerEl.childElementCount > dataSource.length) {
        this.containerEl.lastChild.view.unmount()
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
