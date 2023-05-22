import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML ({
    color,
    round,
    disabled,
    value,
    placeholder,
    iconBefore,
    iconAfter,
    loading
  }) {
    return `<div style="width:100%; height: 100%;" class="control ${loading ? 'is-loading' : ''} ${iconBefore ? 'has-icons-left' : ''} ${iconAfter ? 'has-icons-right' : ''} ">
      <input style="width:100%; height: 100%;" class="input ${color} ${round ? 'is-rounded' : ''}" ${disabled ? 'disabled' : ''} type="text" value="${value || ''}" placeholder="${placeholder}">
    </div>`
  }

  isDroppable (el) {
    if (el.componentPath === 'ridge-bulma/icon') {
      return true
    } else {
      return false
    }
  }

  mounted () {
    this.ensureSlot()
  }

  updated () {
    this.ensureSlot()
  }

  ensureSlot () {
    const {
      iconBefore,
      iconAfter
    } = this.props

    if (iconBefore) {
      iconBefore.position = 'before'
      if (!iconBefore.el) {
        const childDiv = document.createElement('div')
        iconBefore.loadAndMount(childDiv)
      }
      this.el.firstChild.appendChild(iconBefore.el)
      this.updateChildStyle(iconBefore)
    }
    if (iconAfter) {
      iconAfter.position = 'after'
      if (!iconAfter.el) {
        const childDiv = document.createElement('div')
        iconAfter.loadAndMount(childDiv)
      }
      this.el.firstChild.appendChild(iconAfter.el)
      this.updateChildStyle(iconAfter)
    }
  }

  removeChild (wrapper) {
    this.el.firstChild.removeChild(wrapper.el)
    wrapper.el.classList.remove('icon')
    if (wrapper.position === 'before') {
      delete wrapper.position
      this.el.firstChild.classList.remove('has-icons-left')
      wrapper.el.classList.remove('is-left')
      return {
        iconBefore: null
      }
    } else {
      delete wrapper.position
      this.el.firstChild.classList.remove('has-icons-right')
      wrapper.el.classList.remove('is-right')
      return {
        iconAfter: null
      }
    }
  }

  appendChild (wrapper, x, y) {
    const currentRect = this.el.getBoundingClientRect()
    let isBefore = true
    if (x != null) {
      isBefore = x < (currentRect.x + currentRect.width / 2)
    }

    if (isBefore && this.el.firstChild.querySelector('.is-left')) {
      return false
    }
    if (!isBefore && this.el.firstChild.querySelector('.is-right')) {
      return false
    }

    wrapper.position = isBefore ? 'before' : 'after'
    this.el.firstChild.appendChild(wrapper.el)
    this.updateChildStyle(wrapper)
    this.onDragOut()
    if (isBefore) {
      return {
        iconBefore: wrapper.id
      }
    } else {
      return {
        iconAfter: wrapper.id
      }
    }
  }

  updateChildStyle (wrapper) {
    if (wrapper.position === 'before') {
      wrapper.el.classList.add('is-left')
      this.el.firstChild.classList.add('has-icons-left')
      wrapper.el.style.left = '10px'
      wrapper.el.style.right = ''
    } else {
      wrapper.el.classList.add('is-right')
      this.el.firstChild.classList.add('has-icons-right')
      wrapper.el.style.right = '10px'
      wrapper.el.style.left = ''
    }
    wrapper.el.classList.add('icon')
    wrapper.el.style.position = 'absolute'
    wrapper.el.style.transform = ''
    wrapper.el.style.width = wrapper.config.style.width + 'px'
    wrapper.el.style.pointerEvents = 'initial'
    wrapper.el.style.height = '100%'
  }
}
