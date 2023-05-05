import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML (props) {
    return `<button style="width:100%;height:100%;font-size: ${props.fontSize};" class="button ${props.color} ${props.light ? 'is-light' : ''} ${(props.styles || []).join(' ')}">
      ${props.text == null ? '' : `<span class="button-text" style="margin: 0 5px;">${props.text}</span>`}
    </button>`
  }

  isDroppable (el) {
    if (el.componentPath === 'ridge-bulma/icon') {
      return true
    } else {
      return false
    }
  }

  mounted () {
    if (this.props.iconBefore) {
      const childDiv = document.createElement('div')
      this.el.querySelector('button').insertBefore(childDiv, this.el.querySelector('span.button-text'))

      this.props.iconBefore.mount(childDiv)
      this.updateChildStyle(childDiv)
    }
  }

  updateIconBefore () {

  }

  updateChildStyle (el) {
    el.style.position = ''
    el.style.transform = ''
  }

  appendChild (wp, x, y) {
    this.el.querySelector('button').insertBefore(wp.el, this.el.querySelector('span.button-text'))
    this.updateChildStyle(wp.el)
    this.onDragOut()
    return {
      iconBefore: wp.id
    }
  }

  removeChild (wp) {
    this.el.querySelector('button').removeChild(wp.el)
    return {
      iconBefore: ''
    }
  }
}
