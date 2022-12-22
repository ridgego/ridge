export default class ListContainer {
  constructor (props) {
    this.props = props
  }

  isEditMode () {
    return this.props.__mode === 'edit'
  }

  async mount (el) {
    const { renderItem } = this.props

    this.el = el
    this.containerEl = document.createElement('div')
    this.containerEl.classList.add('list-container')
    Object.assign(this.containerEl.style, this.getContainerStyle(this.props))
    el.appendChild(this.containerEl)

    if (renderItem) {
      await renderItem.preload()
    }
    if (this.isEditMode()) { // 编辑
      this.renderInEditor()
    } else {
      this.renderUpdateListItems()
    }
  }

  /**
   * 创建/更新编辑器下渲染
   */
  renderInEditor () {
    const { renderItem } = this.props
    this.containerEl.textContent = ''
    if (!this.containerEl.querySelector('SLOT')) {
      const slotEl = document.createElement('slot')
      slotEl.setAttribute('name', 'renderItem')
      slotEl.elementWrapper = this.props.__elementWrapper
      Object.assign(slotEl.style, this.getSlotStyle())
      this.containerEl.appendChild(slotEl)
      this.slotEl = slotEl
    }

    if (renderItem) {
      if (!renderItem.isMounted()) {
        const el = document.createElement('div')
        renderItem.mount(el)
      }
      // 每次放入都要设置到固定位置
      renderItem.setStyle({
        position: 'static',
        x: 0,
        y: 0
      })
      this.slotEl.appendChild(renderItem.el)
    }
    Object.assign(this.slotEl.style, this.getSlotStyle())
  }

  /**
   * 运行期间更新渲染列表
   */
  renderUpdateListItems () {
    // 可能会 editor/preview 切换
    if (this.slotEl) {
      this.slotEl.parentElement.removeChild(this.slotEl)
      this.slotEl = null
    }
    const { itemKey, dataSource, renderItem, slotKey } = this.props
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
          wrapper.setScopeVariableValues({
            [slotKey || '$scope']: {
              index,
              data,
              listData: dataSource
            }
          })
          wrapper.forceUpdate()
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
          newWrapper.setScopeVariableValues({
            [slotKey || '$scope']: {
              index,
              data,
              listData: dataSource
            }
          })
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

  getContainerStyle () {
    const style = {
      width: '100%',
      height: '100%',
      padding: this.props.padding + 'px',
      border: '1px solid #ccc'
    }

    if (!this.props.grid) {
      style.display = 'flex'
      if (this.props.itemLayout === 'vertical') {
        style.flexDirection = 'column'
      } else if (this.props.itemLayout === 'horizontal') {
        style.flexDirection = 'row'
      }
      style.flexWrap = 'wrap'
      style.gap = '10px'
    }
    return style
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
    elementWrapper.setStyle({
      x: 0,
      y: 0
    })
  }

  /**
   * 按属性联动方法
   * @param {*} props
   */
  update (props) {
    this.props = props
    if (this.isEditMode()) {
      this.renderInEditor()
    } else {
      this.renderUpdateListItems()
    }
    Object.assign(this.containerEl.style, this.getContainerStyle(this.props))
  }
}
