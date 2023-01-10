import Input from './Input'

export default {
  name: 'input',
  component: Input,
  type: 'vanilla',
  props: [{
    label: '内容',
    name: 'value',
    type: 'string',
    value: ''
  }, {
    label: '占位提示',
    name: 'placeholder',
    type: 'string',
    value: '请输入文本'
  }, {
    label: '字号',
    name: 'fontSize',
    type: 'number',
    value: ''
  }, {
    name: 'padding',
    label: '内边距',
    type: 'string',
    control: 'padding',
    value: '5px'
  }, {
    name: 'color',
    label: '颜色',
    type: 'string',
    control: 'color',
    value: ''
  }, {
    name: 'border',
    label: '边框',
    type: 'string',
    control: 'border',
    value: '1px solid #ccc'
  }],
  events: [{
    label: '输入值变化',
    name: 'onChange'
  }, {
    label: '按下回车键',
    name: 'onPressEnter'
  }]
}
