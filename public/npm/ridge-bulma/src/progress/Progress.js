import HTMLComponent from '../base/HTMLComponent'
export default class Button extends HTMLComponent {
  innerHTML (props) {
    return `<progress class="progress ${props.color} ${props.light} ${props.size}  ${(props.styles || []).join(' ')}"
      max="${props.max}" ${props.value != null ? ('value="' + props.value + '"') : ''}>${props.text}</progress>`
  }
}
