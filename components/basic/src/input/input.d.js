import Input from './Input'
import { border } from 'ridge-prop-utils'

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
    name: 'color',
    label: '颜色',
    type: 'string',
    control: 'colorpicker',
    value: ''
  }, ...border.props],
  events: [{
    label: '输入值变化',
    name: 'onChange'
  }, {
    label: '按下回车键',
    name: 'onPressEnter'
  }]
}
