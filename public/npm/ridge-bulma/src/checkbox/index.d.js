import Checkbox from './Checkbox.js'
export default {
  name: 'checkbox',
  title: '切换框',
  component: Checkbox,
  icon: 'IconTickCircle',
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
    value: '我已同意'
  }],
  events: [{
    name: 'onChange',
    label: '值改变'
  }],
  width: 130,
  height: 32
}
