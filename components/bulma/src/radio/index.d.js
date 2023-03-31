import Radio from './Radio.js'
export default {
  name: 'radio',
  title: '单选框',
  component: Radio,
  icon: 'IconRadio',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'value',
    label: '选中项',
    type: 'string',
    value: ''
  }, {
    name: 'options',
    label: '选项',
    type: 'array',
    value: []
  }],
  events: [{
    name: 'onChange',
    label: '值改变'
  }],
  width: 160,
  height: 40
}
