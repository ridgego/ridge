import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML (props) {
    return `<button class="button ${props.color} ${props.light} ${props.size} ${props.full} ${(props.styles || []).join(' ')}">${props.text}</button>`
  }
}
