import BulmaBase from '../base/BulmaBase'
export default class Pagination extends BulmaBase {
  innerHTML ({ color, size, round, options, placeholder, disabled, readonly }) {
    return `<div class="select ${color} ${size} ${round ? 'is-rounded' : ''}">
      <select placeholder="${placeholder}" ${disabled ? 'disabled' : ''}>
        ${options.map(option => `<option ${option.value}>${option.label}</option>`).join('')}
      </select>
    </div>`
  }
}
