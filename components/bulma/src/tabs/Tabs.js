import BulmaBase from '../base/BulmaBase'
export default class Button extends BulmaBase {
  innerHTML (props) {
    return `<div class="tabs ${props.align} ${props.size} ${props.style} ${props.full ? 'is-fullwidth' : ''} ">
      <ul>
        ${props.tabs && props.tabs.map(tab => `<li class="${tab.value === props.value ? 'is-active' : ''}"><a>${tab.label}</a></li>`).join('')}
      </ul>
    </div>`
  }

  mounted () {
    this.el.querySelectorAll('li').onclick = (evt) => {
      console.log(evt)
    }
  }
}
