import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML (props) {
    return `<div class="tabs ${props.align} ${props.size}  ${props.style} ${props.full ? 'is-fullwidth' : ''} ">
      <ul>
        ${props.tabs && props.tabs.map(tab => `<li class="${tab === props.value ? 'is-active' : ''}"><a>${tab}</a></li>`).join('')}
      </ul>
    </div>`
  }

  mounted () {
    this.el.querySelectorAll('li')
  }
}
