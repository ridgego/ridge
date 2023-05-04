import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML (props) {
    return `<button style="width:100%;height:100%;font-size: ${props.fontSize};" class="button ${props.color} ${props.light ? 'is-light' : ''} ${(props.styles || []).join(' ')}">
      ${props.icon ? ` <span class="icon">${props.icon}</span>` : ''}
      ${props.text == null ? '' : `<span>${props.text}</span>`}
    </button>`
  }

  isDroppable (el) {
    if (el.componentPath === '') {
      return true
    } else {
      return false
    }
  }
}
