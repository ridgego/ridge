export default class ListContainer {
  constructor (props) {
    this.props = props
  }

  mount (el) {
    this.el = el
    this.containerEl = document.createElement('div')

    this.containerEl.classList.add('list-container')
    Object.assign(this.containerEl.style, this.getContainerStyle(this.props))
    el.appendChild(this.containerEl)

    if (this.props.renderItem) {
      this.templateItemWrapper = this.props.__elementWrapper.pageManager.getElement(this.props.renderItem)
      this.templateItemWrapper.preload()
    } else {
      this.showSlotElement()
    }
  }

  getContainerStyle () {
    const style = {
      width: '100%',
      height: '100%',
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

  showSlotElement () {
    const slotEl = document.createElement('slot')
    slotEl.setAttribute('name', 'renderItem')
    slotEl.elementWrapper = this.props.__elementWrapper
    Object.assign(slotEl.style, this.getSlotStyle())
    this.containerEl.appendChild(slotEl)
  }

  getSlotStyle () {
    if (this.props.itemLayout === 'vertical') {
      return {
        display: 'block',
        width: '100%',
        minHeight: '80px'
      }
    } else {
      return {
        display: 'block',
        height: '100%',
        minWidth: '80px'
      }
    }
  }

  update (props) {
    if (props.renderItem && this.props.renderItem == null) {
      // 放入项模板
      const targetWrapper = this.props.__elementWrapper.pageManager.getElement(props.renderItem)
      if (targetWrapper) {
        targetWrapper.setStyle({
          position: 'static'
        })
        this.containerEl.appendChild(targetWrapper.el)
      }
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
