import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML ({
    size,
    color,
    round,
    disabled,
    value,
    placeholder,
    iconBefore,
    iconAfter,
    loading
  }) {
    return `<div class="field">
    <p class="control ${iconBefore ? 'has-icons-left' : ''} ${iconAfter ? 'has-icons-right' : ''} ${loading ? 'is-loading' : ''}">
      <input class="input ${size}  ${color}  ${round ? 'is-rounded' : ''}" ${disabled ? 'disabled' : ''} type="text" value="${value || ''}" placeholder="${placeholder}">
${iconBefore
? `<span class="icon ${size} is-left">
        <i class='${iconBefore}'></i>
      </span>`
: ''}
${iconAfter
? `<span class="icon ${size} is-right">
  <i class='${iconAfter}'></i>
</span>`
 : ''}
    </p>
  </div>`
  }

  mounted () {
    this.updateBindEvents()
  }

  updateBindEvents () {
    const { onChange, input } = this.props
    this.el.querySelector('input').oninput = (evt) => {
      const value = evt.target.value
      input && input(value)
      if (value !== this.props.value) {
        onChange && onChange(value)
      }
    }
  }

  updated () {
    this.updateBindEvents()
  }
}
