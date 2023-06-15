import HTMLComponent from '../base/HTMLComponent'
export default class Button extends HTMLComponent {
  innerHTML ({
    color,
    size,
    light,
    outline,
    round,
    loading,
    disabled,
    icon,
    text
  }) {
    return `<button style="width:100%;height:100%;" class="button ${color} ${size} ${light ? 'is-light' : ''} ${outline ? 'is-outlined' : ''}
      ${round ? 'is-rounded' : ''} ${loading ? 'is-loading' : ''}" ${disabled ? 'disabled' : ''}>
      ${icon ? '<span class="icon ' + icon + '"></span>' : ''}
      ${text == null ? '' : `<span class="button-text">${text}</span>`}
    </button>`
  }

  isDroppable (el) {
    return false
  }

  mounted () {
    Object.assign(this.el.querySelector('button').style, this.props.fontStyle)
    this.el.querySelector('button').onclick = () => {
      this.props.onClick && this.props.onClick()
    }
    // this.ensureButtonIcon()
  }

  updated () {
    Object.assign(this.el.querySelector('button').style, this.props.fontStyle)
    this.el.querySelector('button').onclick = () => {
      this.props.onClick && this.props.onClick()
    }
    // this.ensureButtonIcon()
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
    let isBefore = true
    if (x != null) {
      isBefore = x < (currentRect.x + currentRect.width / 2)
    }

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
