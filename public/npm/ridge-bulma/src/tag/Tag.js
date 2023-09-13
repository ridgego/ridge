import HTMLComponent from '../base/HTMLComponent'
export default class Button extends HTMLComponent {
  innerHTML (props) {
    if (props.addon && props.isDelete) {
      return `<div class="tags has-addons">
        <span class="tag ${props.color} ${props.size} ${props.light ? 'is-light' : ''}">${props.text || '标签'}</span>
        <a class="tag is-delete ${props.size}"></a>
      </div>`
    } else if (props.addon) {
      return `<div class="tags has-addons">
        <span class="tag ${props.color} ${props.size} ${props.light ? 'is-light' : ''}">${props.text || '标签'}</span>
        <span class="tag ${props.addonColor} ${props.size} ${props.addonLight ? 'is-light' : ''}">${props.addonText || '扩展'}</span>
      </div>`
    } else {
      return `<span class="tag ${props.color} ${props.size} ${props.light ? 'is-light' : ''}">
          ${props.text}
          ${props.isDelete ? '<button class="delete ' + props.size + '"></button>' : ''}
      </span>`
    }
  }
}
