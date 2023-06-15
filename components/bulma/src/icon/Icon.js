import HTMLComponent from '../base/HTMLComponent'
import './style.css'

export default class Icon extends HTMLComponent {
  innerHTML (props) {
    return `<span style="width:100%; height: 100%; color: ${props.color}; background-color: ${props.backgroundColor}; font-size: ${props.size}px" class="icon ${props.icon}">
    </span>`
  }
}
