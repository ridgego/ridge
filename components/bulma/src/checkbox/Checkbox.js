import BulmaBase from '../base/BulmaBase'
export default class CheckBox extends BulmaBase {
  innerHTML ({ label, value }) {
    return `<label class="checkbox">
      <input type="checkbox" ${value ? 'checked' : ''}>
      ${label}
    </label>`
  }
}
