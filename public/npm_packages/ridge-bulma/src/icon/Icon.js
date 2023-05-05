import BulmaBase from '../base/BulmaBase'
import './style.css'

export default class Icon extends BulmaBase {
  innerHTML (props) {
    return `<span style="width:100%; height: 100%; color: ${props.color}; background-color: ${props.backgroundColor}" class="icon">
      ${props.icon || ''}
    </span>`
  }
}