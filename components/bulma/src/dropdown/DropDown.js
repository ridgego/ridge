import BulmaBase from '../base/BulmaBase'
export default class DropDown extends BulmaBase {
  innerHTML (props) {
    return `<div class="dropdown ${props.isActive} ${props.hoverable ? 'is-hoverable' : ''}">
    <div class="dropdown-trigger">
      <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
        <span>${props.text}</span>
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
