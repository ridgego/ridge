import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML (props) {
    return `<div class="tabs ${props.align} ${props.size} ${props.style} ${props.full ? 'is-fullwidth' : ''} ">
      <ul>
        ${props.tabs && props.tabs.map(tab => `<li data-value="${tab.value}" class="${tab.value === props.value ? 'is-active' : ''}"><a>${tab.label}</a></li>`).join('')}
      </ul>
    </div>`
  }

  mounted () {
    const { onTabChange, input } = this.props
    this.el.querySelectorAll('li').forEach(li => {
      li.onclick = () => {
        const value = li.dataset.value
        input && input(value)
        if (value !== this.props.value) {
          onTabChange && onTabChange(value)
        }
      }
    })
  }
}
