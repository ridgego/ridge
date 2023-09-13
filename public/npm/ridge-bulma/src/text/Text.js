import HTMLComponent from '../base/HTMLComponent'
export default class Button extends HTMLComponent {
  innerHTML ({
    text
  }) {
    return `<div style="width:100%; height: 100%;" class="text">
      ${text == null ? '' : text}
    </div>`
  }

  mounted () {
    Object.assign(this.el.querySelector('div.text').style, this.props.fontStyle, {
      padding: this.props.padding
    })
  }

  updated () {
    Object.assign(this.el.querySelector('div.text').style, this.props.fontStyle, {
      padding: this.props.padding
    })
  }
}
