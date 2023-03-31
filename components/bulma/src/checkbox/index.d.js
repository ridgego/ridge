import Checkbox from './Checkbox.js'
export default {
  name: 'checkbox',
  title: '切换选框',
  component: Checkbox,
  icon: 'IconCheckboxTick',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'value',
    label: '是否选中',
    type: 'boolean',
    value: false
  }, {
    name: 'label',
    label: '内容',
    type: 'string',
    value: ''
  }],
  events: [{
    name: 'onChange',
    label: '值改变'
  }],
  width: 160,
  height: 40
}
