import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML (props) {
    return `<progress class="progress ${props.color} ${props.light} ${props.size}  ${(props.styles || []).join(' ')}"
      max="${props.max}" ${props.value != null ? ('value="' + props.value + '"') : ''}>${props.text}</progress>`
  }
}
