import BulmaBase from '../base/BulmaBase'
export default class DropDown extends BulmaBase {
  innerHTML (props) {
    return `<div class="dropdown ${props.isActive} ${props.hoverable ? 'is-hoverable' : ''}">
    <div class="dropdown-trigger">
      <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
        <span>${props.text}</span>
        <span class="icon is-small">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" focusable="false" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.08045 7.59809C4.66624 7.01231 5.61599 7.01231 6.20177 7.59809L11.8586 13.2549L17.5155 7.59809C18.1013 7.01231 19.051 7.01231 19.6368 7.59809C20.2226 8.18388 20.2226 9.13363 19.6368 9.71941L12.9193 16.4369C12.3335 17.0227 11.3838 17.0227 10.798 16.4369L4.08045 9.71941C3.49467 9.13363 3.49467 8.18388 4.08045 7.59809Z" fill="currentColor"></path></svg>
          <i class="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </button>
    </div>
    <div class="dropdown-menu" role="menu">
      <div class="dropdown-content">
        ${(props.menus || ['选项1', '选项2', '-', 'C']).map(str => str === '-'
            ? '<hr class="dropdown-divider">'
            : `<a href="#" class="dropdown-item ${props.value === str ? 'is-active' : ''}">${str}</a>`).join('')}
      </div>
    </div>
  </div>`
  }

  mounted () {
    this.container = this.el.querySelector('.dropdown')
    if (!this.props.hoverable) {
      this.active = false
      this.container.onclick = () => {
        this.active = !this.active
        this.toggleActive()
      }
      document.body.addEventListener('click', e => {
        if (!this.container.contains(e.target)) {
          this.active = false
          this.toggleActive()
        }
      })
    }

    this.container.querySelectorAll('.dropdown-item').forEach(element => {
      element.onclick = () => {
        this.props.onClick && this.props.onClick(element.innerHTML)
        this.props.input && this.props.input(element.innerHTML)
      }
    })
  }

  toggleActive () {
    if (this.active) {
      this.container.classList.add('is-active')
    } else {
      this.container.classList.remove('is-active')
    }
  }
}
