import Container from '../Container'

export default class ListContainer extends Container {
  async mount (el) {
    this.el = el
    const containerDiv = document.createElement('div')
    this.el.appendChild(containerDiv)

    this.containerEl = containerDiv
    this.wrapper = this.props.__elementWrapper
    this.mode = this.props.__mode
    Object.assign(this.containerEl.style, {
      width: '100%',
      height: '100%'
    }, this.getContainerStyle())

    if (this.props.renderItem) {
      await this.props.renderItem.preload()
      this.props.renderItem.initPropsAndEvents()
    }
    if (this.mode === 'edit') {
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
    if (this.props.renderItem) {
      return false
    } else {
      return true
    }
  }

  // 拖动进入
  onDragOver (wrapper) {
    const shadowNode = this.containerEl.querySelector(':scope > .drop-shadow')

    if (!shadowNode) {
      const shadowNode = document.createElement('div')
      shadowNode.classList.add('drop-shadow')
      shadowNode.style.width = '100%'
      shadowNode.style.height = '100%'

      shadowNode.style.borderRadius = 'var(--semi-border-radius-small)'
      shadowNode.style.border = '2px dashed var(--semi-color-primary)'
      shadowNode.style.backgroundColor = 'var(--semi-color-primary-light-default)'
      this.containerEl.appendChild(shadowNode)
    }
  }

  // 拖动离开
  onDragOut () {
    if (this.containerEl.querySelector(':scope > .drop-shadow')) {
      this.containerEl.removeChild(this.containerEl.querySelector(':scope > .drop-shadow'))
    }
  }

  getChildren () {
    return []
  } // ?

  // 增加
  appendChild (wrapper, x, y) {
    const el = wrapper.el
    if (this.containerEl.querySelector(':scope > .drop-shadow')) {
      this.containerEl.removeChild(this.containerEl.querySelector(':scope > .drop-shadow'))
    }
    this.containerEl.appendChild(el)

    Object.assign(el.style, wrapper.getResetStyle(), {
      width: wrapper.config.style.width + 'px',
      height: wrapper.config.style.height + 'px'
    })

    this.props.renderItem = wrapper.id

    return {
      renderItem: wrapper.id
    }
  }

  updateChildStyle (wrapper) {
    Object.assign(wrapper.el.style, wrapper.getResetStyle(), {
      width: wrapper.config.style.width + 'px',
      height: wrapper.config.style.height + 'px'
    })
  }

  removeChild (wrapper, isDelete) {
    // 原地阴影
    if (wrapper.el.parentElement === this.containerEl) {
      if (!isDelete) {
        this.onDragOver()
      }
      this.containerEl.removeChild(wrapper.el)
    } else {
      console.warn('not children ')
    }
    this.props.renderItem = null
    return {
      renderItem: null
    }
  } // 移除

  update (props) {
    this.props = props
    if (this.mode !== 'edit') {
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
          const wrapper = existedEl.elementWrapper

          // 更新属性后强制更新
          // wrapper.listIndex = index
          wrapper.setScopeItem(data)
          wrapper.forceUpdate()
          // wrapper.setScopeStateValues({
          //   $item: data,
          //   $index: index,
          //   $list: dataSource
          // })
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
          const newWrapper = renderItem.clone()
          newWrapper.parentWrapper = this.wrapper

          newWrapper.setScopeItem(data)
          // newWrapper.setScopeStateValues({
          //   $hover: false,
          //   $item: data,
          //   $index: index,
          //   $list: dataSource
          // })
          newWrapper.mount(newEl)
        }
      }

      // 删除多出的项目
      while (this.containerEl.childElementCount > dataSource.length) {
        this.containerEl.lastChild.elementWrapper.unmount()
      }

      this.itemInstanceWrappers = Array.from(this.containerEl.childNodes).map(el => el.elementWrapper)
    }
  }

  getSlotStyle () {
    if (this.props.itemLayout === 'vertical') {
      return {
        border: '1px dashed rgb(164,224,167)',
        display: 'block',
        width: '100%',
        height: '80px'
      }
    } else {
      return {
        border: '1px dashed rgb(164,224,167)',
        display: 'block',
        height: '100%',
        width: '80px'
      }
    }
  }

  updateChild (elementWrapper) {
    elementWrapper.setConfigStyle({
      x: 0,
      y: 0
    })
  }
}
