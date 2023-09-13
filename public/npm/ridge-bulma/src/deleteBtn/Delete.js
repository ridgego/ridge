import HTMLComponent from '../base/HTMLComponent'
export default class Delete extends HTMLComponent {
  innerHTML (props) {
    return `<button class="delete ${props.size}"></button>`
  }
}
