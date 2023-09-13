import HTMLComponent from '../base/HTMLComponent'
export default class TextArea extends HTMLComponent {
  innerHTML (props) {
    return `<textarea rows="${props.rows}" class="textarea ${props.color} ${props.size}" ${props.disabled ? 'disabled' : ''} placeholder="${props.placeholder}">${props.value}</textarea>`
  }
}
