import { border } from 'ridge-prop-utils'

export default class ListContainer {
  constructor (props) {
    this.props = props
  }

  isEditMode () {
    if (this.props.__pageManager && this.props.__pageManager.mode === 'edit') {
      return true
    } else {
      return false
    }
  }

  async mount (el) {
    const { renderItem } = this.props

    this.el = el
    this.containerEl = document.createElement('div')
    this.containerEl.classList.add('list-container')
    Object.assign(this.containerEl.style, this.getContainerStyle(this.props))
    el.appendChild(this.containerEl)

    if (renderItem) {
      await renderItem.preload(true)
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
      this.containerEl.appendChild(slotEl)
      this.slotEl = slotEl
    }

    this.slotEl.style.display = 'block'
    this.slotEl.style.width = 'calc(100% - 20px)'
    this.slotEl.style.height = 'calc(100% - 20px)'

    if (renderItem) {
      if (!renderItem.isMounted()) {
        const el = document.createElement('div')
        renderItem.mount(el)
      }
      // 每次放入都要设置到固定位置
      renderItem.setConfigStyle({
        position: 'relative',
        x: 0,
        y: 0
      })
      this.slotEl.appendChild(renderItem.el)
      this.slotEl.setAttribute('tpl', renderItem.id)
    } else {
      this.slotEl.style.border = '1px dashed rgb(164,224,167)'
      this.slotEl.style.display = 'flex'
      this.slotEl.style.alignItems = 'center'
      this.slotEl.style.justifyContent = 'center'
      this.slotEl.style.fontSize = '14px'
      this.slotEl.innerHTML = '请拖拽放入列表项模板'
    }
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
          wrapper.setScopeStateValues({
            $item: data,
            $index: index,
            $list: dataSource
          })
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
          newWrapper.setScopeStateValues({
            $hover: false,
            $item: data,
            $index: index,
            $list: dataSource
          })
          newWrapper.mount(newEl)
          newEl.onmouseenter = (e) => {
            newWrapper.setScopeStateValues({
              $hover: true
            })
          }
          newEl.onmouseleave = (e) => {
            newWrapper.setScopeStateValues({
              $hover: false
            })
          }
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
      overflow: 'overlay'
    }

    Object.assign(style, border.style(this.props))

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
