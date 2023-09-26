import CheckBox from './CheckBox'

export default {
  name: 'checkbox',
  component: CheckBox,
  icon: 'icon/checkbox.svg',
  type: 'vanilla',
  title: '复选框',
  order: 9,
  width: 90,
  height: 24,
  props: [{
    label: '选中',
    name: 'value',
    type: 'boolean'
  }, {
    name: 'border',
    label: '边框',
    type: 'string',
    control: 'border',
    value: '1px solid #ccc'
  }, {
    label: '圆角',
    name: 'borderRadius',
    type: 'number',
    value: 0
  }, {
    name: 'backgroundColor',
    label: '背景色',
    type: 'string',
    control: 'colorpicker'
  }, {
    name: 'backgroundColorChecked',
    label: '选中颜色',
    type: 'string',
    control: 'colorpicker'
  }],
  events: [{
    label: '输入值变化',
    name: 'onChange'
  }]
}
