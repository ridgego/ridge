import BulmaBase from '../base/BulmaBase'
export default class Notification extends BulmaBase {
  innerHTML ({
    color,
    size,
    light,
    hasDelete,
    text
  }) {
    return `<div class="notification ${color} ${light ? 'is-light' : ''}">
      ${hasDelete ? '<button class="delete"></button>' : ''}
      ${text}
  </div>`
  }
}
