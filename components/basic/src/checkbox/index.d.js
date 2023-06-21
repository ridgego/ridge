import CheckBox from './CheckBox'

export default {
  name: 'checkbox',
  component: CheckBox,
  icon: 'bi bi-check2-circle',
  type: 'vanilla',
  title: '单选框',
  width: 24,
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
