import BulmaBase from '../base/BulmaBase'
export default class Image extends BulmaBase {
  innerHTML (props) {
    return `<figure class="image" style="width: 100%;height:100%">
      <img style="object-fit: ${props.objectFit}; width:100%;height:100%" src="${props.url}">
  </figure>`
  }
}
