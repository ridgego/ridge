export default class SwitchContainer {
  constructor (props) {
    this.props = props
    this.isRuntime = props.__mode !== 'edit'
  }

  async mount (el) {
    const { states } = this.props
    this.el = el
    const containerDiv = document.createElement('div')
    this.containerEl = containerDiv

    if (this.className) {
      containerDiv.classList.add(this.className)
    }
    el.appendChild(containerDiv)

    Object.assign(this.containerEl.style, {
      width: '100%',
      height: '100%'
    }, this.getContainerStyle())

    // 补充所有状态
    for (const state of states) {
      const childDiv = document.createElement('div')
      childDiv.setAttribute('state', state)
      this.containerEl.appendChild(childDiv)
    }

    this.toggleState()
  }

  update (props) {
    this.props = props
  }

  toggleState () {
    const { states, currentState, children } = this.props
    const stateName = currentState || states[0]

    const stateEl = this.containerEl.querySelector(`div[state="${stateName}"]`)

    if (!stateEl) {
      this.containerEl.innerHTML = '请添加状态'
    } else {
      const stateElement = children.filter(child => child.props.stateName === stateName)[0]

      if (stateElement === null) {
        stateEl.innerHTML = '请拖拽放入组件'
      } else {
        if (!stateElement.el) {
          const el = document.createElement('div')
          stateEl.innerHTML = ''
          stateEl.appendChild(el)
          stateElement.loadAndMount()
        }
      }
    }
  }

  getContainerStyle () {
    const containerStyle = {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
    return containerStyle
  }

  getChildStyle (wrapper, beforeRect) {
    if (beforeRect) { // 刚从外部放入
      const rect = this.containerEl.getBoundingClientRect()
      const zoom = rect.width / this.wrapper.config.style.width

      const computedStyle = window.getComputedStyle(this.containerEl)
      const borderTopWidth = parseInt(computedStyle.borderTopWidth) || 0
      const borderLeftWidth = parseInt(computedStyle.borderLeftWidth) || 0

      wrapper.config.style.position = 'absolute'
      wrapper.config.style.x = (beforeRect.x - rect.x - borderTopWidth) / zoom
      wrapper.config.style.y = (beforeRect.y - rect.y - borderLeftWidth) / zoom
      return {
        position: 'absolute',
        transform: `translate(${wrapper.config.style.x}px, ${wrapper.config.style.y}px)`
      }
    } else {
      return {
        position: 'absolute',
        transform: `translate(${wrapper.config.style.x}px, ${wrapper.config.style.y}px)`,
        width: wrapper.config.style.width + 'px',
        height: wrapper.config.style.height + 'px'
      }
    }
  }

  getShadowStyle (configStyle) {
    return {
      width: '100%',
      height: '100%'
    }
  }

  updateStyle (style) {

  }

  mounted () {

  }
}
