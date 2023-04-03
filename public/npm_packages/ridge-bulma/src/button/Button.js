import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML (props) {
    return `<button class="button ${props.color} ${props.light ? 'is-light' : ''} ${props.size} ${props.full} ${(props.styles || []).join(' ')}">
      ${props.icon ? ` <span class="icon ${props.size}">${props.icon}</span>` : ''}
      ${props.text == null ? '' : `<span>${props.text}</span>`}
    </button>`
  }
}
