import Input from './Input'
export default {
  name: 'input',
  component: Input,
  icon: 'bi bi-textarea-resize',
  type: 'vanilla',
  title: '输入框',
  width: 160,
  height: 28,
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
    label: '字体',
    name: 'font',
    type: 'font',
    value: {}
  }, {
    name: 'color',
    label: '颜色',
    type: 'string',
    control: 'colorpicker',
    value: ''
  }],
  events: [{
    label: '输入值变化',
    name: 'onChange'
  }, {
    label: '按下回车键',
    name: 'onPressEnter'
  }]
}
