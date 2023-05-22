import BulmaBase from '../base/BulmaBase'
export default class Image extends BulmaBase {
  innerHTML (props) {
    if (this.props.rectStyle && this.props.rectStyle.background) {
      return '<div class="mask-image image-root" style="width:100%; height: 100%; background-size: cover; background-repeat: no-repeat;"/>'
    } else {
      return `<figure class="image image-root" style="width: 100%;height:100%">
        <img style="object-fit: ${props.objectFit}; width:100%;height:100%" src="${props.url}">
    </figure>`
    }
  }

  innerHTMLSet () {
    const rootEl = this.el.querySelector('.image-root')
    rootEl.style.overflow = 'hidden'

    if (this.props.rectStyle && this.props.rectStyle.background) {
      rootEl.style.maskImage = `url('${this.props.url}')`
      rootEl.style.webkitMaskImage = `url('${this.props.url}')`
      rootEl.style.background = this.props.rectStyle.background
      rootEl.style.webkitMaskSize = this.props.objectFit
    }

    Object.assign(this.el.querySelector('.image-root').style, this.props.rectStyle)
  }
}
