import HTMLComponent from '../base/HTMLComponent'
export default class CheckBox extends HTMLComponent {
  innerHTML ({ label, value }) {
    return `<label class="checkbox">
      <input type="checkbox" ${value ? 'checked' : ''}>
      ${label}
    </label>`
  }
}
