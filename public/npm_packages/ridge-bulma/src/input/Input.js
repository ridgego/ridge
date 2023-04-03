import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML ({
    color,
    size,
    round,
    disabled,
    value,
    placeholder,
    iconLeft,
    loading
  }) {
    return `<div class="control ${size} ${loading ? 'is-loading' : ''} ${iconLeft ? 'has-icons-left' : ''}">
      <input class="input ${color} ${size} ${round ? 'is-rounded' : ''}" ${disabled ? 'disabled' : ''} type="text" value="${value}" placeholder="${placeholder}">
      ${iconLeft
        ? `<span class="icon ${size} is-left">
                  ${iconLeft}
              </span>`
        : ''
      }
    </div>`
  }
}
