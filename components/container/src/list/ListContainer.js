export default class ListContainer {
  constructor (props) {
    this.props = props
  }

  async mount (el) {
    this.el = el
    this.containerEl = document.createElement('div')
    this.containerEl.classList.add('list-container')
    el.appendChild(this.containerEl)

    Object.assign(this.containerEl.style, this.getContainerStyle(this.props))
    this.renderContent()
  }

  renderContent () {
    if (this.props.__editor) { // 编辑
      this.ensureSlotItem()
      if (this.props.renderItem) {
        this.templateItemWrapper = this.props.__elementWrapper.pageManager.getElement(this.props.renderItem)
        const slotEl = document.createElement('div')
        this.templateItemWrapper.mount(slotEl)
        this.slotEl.appendChild(slotEl)
      }
    } else {
      // 可能会 editor/preview 切换
      if (this.slotEl) {
        this.slotEl.parentElement.removeChild(this.slotEl)
        this.slotEl = null
      }
      this.renderUpdateListItems()
    }
  }

  /**
   * 运行期间更新渲染列表
   */
  renderUpdateListItems () {
    const { itemKey, dataSource, renderItem, __pageManager: pageManager } = this.props
    if (dataSource && renderItem) {
      this.templateItemWrapper = pageManager.getElement(renderItem)

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
            $index: index,
            $scope: data,
            $listData: dataSource
          })
          wrapper.forceUpdate()
        } else {
          const newEl = document.createElement('div')
          if (itemKey) {
            newEl.setAttribute('key', data[itemKey])
          }
          if (this.containerEl.children[index]) {
            this.containerEl.insertBefore(newEl, this.containerEl.children[index])
          }
          const newWrapper = this.templateItemWrapper.clone()
          newWrapper.setScopeVariableValues({
            $index: index,
            $scope: data,
            $listData: dataSource
          })
          newWrapper.mount(newEl)
        }
      }

      // 删除多出的项目
      while (this.containerEl.childElementCount > dataSource.length) {
        this.containerEl.lastChild.elementWrapper.unmount()
      }
    }
  }

  getContainerStyle () {
    const style = {
      width: '100%',
      height: '100%',
      padding: this.props.padding + 'px',
      border: '1px solid #ccc'
    }

    if (this.props.grid.enabled === false) {
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

  ensureSlotItem () {
    if (!this.containerEl.querySelector('SLOT')) {
      const slotEl = document.createElement('slot')
      slotEl.setAttribute('name', 'renderItem')
      slotEl.elementWrapper = this.props.__elementWrapper
      Object.assign(slotEl.style, this.getSlotStyle())
      this.containerEl.appendChild(slotEl)
      this.slotEl = slotEl
    }
  }

  getSlotStyle () {
    if (this.props.itemLayout === 'vertical') {
      return {
        border: '1px dashed rgb(164,224,167)',
        display: 'block',
        width: '100%',
        minHeight: '80px'
      }
    } else {
      return {
        border: '1px dashed rgb(164,224,167)',
        display: 'block',
        height: '100%',
        minWidth: '80px'
      }
    }
  }

  updateChild (el) {
    el.elementWrapper.setStyle({
      x: 0,
      y: 0
    })
  }

  update (props) {
    this.props = props
    const { __editor } = this.props

    if (__editor) {
      if (props.renderItem) {
        // 放入项模板
        const targetWrapper = this.props.__pageManager.getElement(props.renderItem)
        if (targetWrapper) {
          targetWrapper.setStyle({
            position: 'static',
            x: 0,
            y: 0
          })
          this.containerEl.querySelector('SLOT').appendChild(targetWrapper.el)
        }
      } else {
        // 移出项模板
        this.ensureSlotItem()
      }

      Object.assign(this.slotEl.style, this.getSlotStyle())
      Object.assign(this.containerEl.style, this.getContainerStyle(this.props))
    } else {
      this.renderContent()
    }
  }

  dropElement (el, targetEl) {
    if (el.parentElement === this.$el.current) {
      el.setAttribute('snappable', 'false')
      el.style.position = ''
      el.style.transform = ''
      return true
    }
    const children = this.$el.current.children

    if (children.length) {
      const confirm = (window.Ridge && window.Ridge.confirm) || window.confirm
      if (!confirm('列表已经有列表项模板， 是否确认替换？ （替换后原有模板会被删除）')) {
        return false
      }
      this.$el.current.removeChild(children[0])
    }
    console.log('drop element', el)
    el.setAttribute('snappable', 'false')
    el.style.position = ''
    el.style.transform = ''
    this.$el.current.appendChild(el)
    return true
  }
}
