import BulmaBase from '../base/BulmaBase'
export default class Radio extends BulmaBase {
  innerHTML ({ options, value }) {
    const name = 'radio' + this.random()
    return `<div class="control">
      ${options.map(option => `<label class="radio">
        <input type="radio" name="${name}" value="${option.value}" ${value === option.value ? 'checked' : ''}>
        ${option.label}
      </label>`).join('')}
    </div>`
  }
}
