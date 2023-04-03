import BulmaBase from '../base/BulmaBase'
export default class Delete extends BulmaBase {
  innerHTML (props) {
    return `<button class="delete ${props.size}"></button>`
  }
}
