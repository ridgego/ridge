import HTMLComponent from '../base/HTMLComponent'
export default class Image extends HTMLComponent {
  innerHTML (props) {
    return `<figure class="image image-root" style="width: 100%;height:100%;">
        ${props.url ? `<img style="object-fit: ${props.objectFit}; width:100%;height:100%" src="${props.url}">` : '<div style="width: 100%;height:100%; display: flex; justify-content: center; align-items: center; background: #CCCCCC;color: #969696;">图片</div>'}
    </figure>`
  }

  innerHTMLSet () {
    const rootEl = this.el.querySelector('.image-root')
    rootEl.style.overflow = 'hidden'
    Object.assign(this.el.querySelector('.image-root').style, this.props.rectStyle)
  }
}
