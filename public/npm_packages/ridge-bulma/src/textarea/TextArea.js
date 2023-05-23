import BulmaBase from '../base/BulmaBase'
export default class TextArea extends BulmaBase {
  innerHTML (props) {
    return `<textarea rows="${props.rows}" class="textarea ${props.color} ${props.size}" ${props.disabled ? 'disabled' : ''} placeholder="${props.placeholder}">${props.value}</textarea>`
  }
}
