import Input from './Input.jsx'
export default {
  name: 'TextInput',
  title: '单行输入',
  component: Input,
  icon: 'icons/input-field.svg',
  order: 1,
  type: 'react',
  props: [{
    name: 'value',
    label: '内容',
    connect: true,
    type: 'string',
    value: ''
  }, {
    name: 'placeholder',
    label: '提示信息',
    connect: true,
    type: 'string',
    value: ''
  }, {
    name: 'invalid',
    label: '不合法',
    connect: true,
    type: 'boolean'
  }, {
    name: 'size',
    label: '字体大小',
    type: 'number',
    width: '50%',
    value: 14
  }, {
    name: 'disabled',
    label: '禁用',
    width: '50%',
    type: 'boolean',
    value: false
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
