import CheckBox from './CheckBox'

export default {
  name: 'checkbox',
  component: CheckBox,
  type: 'vanilla',
  props: [{
    label: '选中',
    name: 'value',
    type: 'boolean'
  }, {
    label: '边长',
    name: 'size',
    type: 'number',
    value: ''
  }, {
    name: 'border',
    label: '边框',
    type: 'string',
    control: 'border',
    value: '1px solid #ccc'
  }, {
    name: 'backgroundColor',
    label: '选中颜色',
    type: 'string',
    control: 'colorpicker'
  }, {
    name: 'backgroundColor',
    label: '选中颜色',
    type: 'string',
    control: 'colorpicker'
  }],
  events: [{
    label: '输入值变化',
    name: 'onChange'
  }]
}
