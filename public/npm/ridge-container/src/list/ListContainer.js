import BaseContainer from '../BaseContainer.js'

export default class ListContainer extends BaseContainer {
  async mounted () {
    if (this.props.renderItem) {
      await this.props.renderItem.preload(true)
      this.props.renderItem.initPropsAndEvents()
    }
    if (this.view) {
      // 编辑时
      if (this.props.renderItem) {
        const renderEl = document.createElement('div')
        this.containerEl.appendChild(renderEl)
        this.props.renderItem.loadAndMount(renderEl)
      }
    } else {
      this.renderUpdateListItems()
    }
  }

  getContainerStyle () {
    return {}
  }

  isDroppable () {
    const el = this.containerEl.querySelector(':scope > .ridge-element')
    if (el) {
      return false
    } else {
      return true
    }
  }

  getChildren () {
    const el = this.containerEl.querySelector(':scope > .ridge-element')
    if (el) {
      return {
        renderItem: el.view.config.id
      }
    } else {
      return {
        renderItem: null
      }
    }
  }

  // 增加
  appendChild (view) {
    this.onDragOut()

    const el = view.el
    this.containerEl.appendChild(el)
    this.updateChildStyle(view)
    return true
  }

  updated () {
    if (!this.isEditMode()) {
      this.renderUpdateListItems()
    }
  }

  /**
   * 运行期间更新渲染列表
   */
  renderUpdateListItems () {
    const { itemKey, dataSource, renderItem } = this.props
    if (dataSource && renderItem) {
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
          const view = existedEl.view

          // 更新属性后强制更新
          // wrapper.listIndex = index
          view.setScopedData({
            i: index,
            list: dataSource,
            item: data
          })
          view.forceUpdate()
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
          const newView = renderItem.clone()

          newView.loadAndMount(newEl, {
            i: index,
            list: dataSource,
            item: data
          })
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
