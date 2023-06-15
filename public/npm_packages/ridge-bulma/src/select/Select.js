import HTMLComponent from '../base/HTMLComponent'
export default class Select extends HTMLComponent {
  innerHTML ({ color, size, round, options, placeholder, disabled, readonly, value }) {
    return `<div class="select ${color} ${size} ${round ? 'is-rounded' : ''}">
      <select placeholder="${placeholder}" ${disabled ? 'disabled' : ''}>
        ${options.map(option => `<option ${option.value === value ? 'selected' : ''} value="${option.value}">${option.label}</option>`).join('')}
      </select>
    </div>`
  }

  mounted () {
    this.updateBindEvents()
  }

  updateBindEvents () {
    const { onChange, input } = this.props
    this.el.querySelector('select').onchange = (evt) => {
      const value = evt.target.value
      input && input(value)
      if (value !== this.props.value) {
        onChange && onChange(value)
      }
    }
  }
}
