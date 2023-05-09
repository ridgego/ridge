import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML (props) {
    return `<button style="width:100%;height:100%;font-size: ${props.fontSize};" class="button ${props.color} ${props.light ? 'is-light' : ''} ${(props.styles || []).join(' ')}">
      ${props.text == null ? '' : `<span class="button-text" style="margin: 0 10px">${props.text}</span>`}
    </button>`
  }

  isDroppable (el) {
    if (el.componentPath === 'ridge-bulma/icon' && !this.el.querySelector('.ridge-element')) {
      return true
    } else {
      return false
    }
  }

  mounted () {
    this.ensureButtonIcon()
  }

  updated () {
    this.ensureButtonIcon()
  }

  ensureButtonIcon () {
    if (this.props.iconBefore) {
      if (!this.props.iconBefore.el) {
        const childDiv = document.createElement('div')
        this.props.iconBefore.loadAndMount(childDiv)
      }
      this.el.querySelector('button').insertBefore(this.props.iconBefore.el, this.el.querySelector('span.button-text'))
      this.updateChildStyle(this.props.iconBefore)
    } else if (this.props.iconAfter) {
      if (!this.props.iconAfter.el) {
        const childDiv = document.createElement('div')
        this.props.iconAfter.loadAndMount(childDiv)
      }
      this.el.querySelector('button').insertAfter(this.props.iconAfter.el, this.el.querySelector('span.button-text'))
      this.updateChildStyle(this.props.iconAfter)
    }
  }

  removeChild (wrapper) {
    this.el.querySelector('button').removeChild(wrapper.el)
    return {
      iconBefore: null,
      iconAfter: null
    }
  }

  appendChild (wp, x, y) {
    const currentRect = this.el.getBoundingClientRect()
    const isBefore = x < (currentRect.x + currentRect.width / 2)

    if (isBefore) {
      this.el.querySelector('button').insertBefore(wp.el, this.el.querySelector('span.button-text'))
    } else {
      this.el.querySelector('button').appendChild(wp.el)
    }

    this.updateChildStyle(wp)
    this.onDragOut()
    return {
      iconBefore: wp.id
    }
  }
}
