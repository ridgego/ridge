import Input from './Input.jsx'
export default {
  name: 'TextInput',
  title: '单行输入',
  component: Input,
  icon: 'bi bi-input-cursor',
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
    name: 'validState',
    label: '验证',
    connect: true,
    type: 'radiogroup',
    options: [{
      label: '有效',
      value: true
    }, {
      label: '无效',
      value: false
    }, {
      label: '无',
      value: null
    }],
    value: null
  }, {
    name: 'validMsg',
    label: '有效提示',
    connect: true,
    type: 'string',
    value: ''
  }, {
    name: 'invalidMsg',
    label: '无效提示',
    connect: true,
    type: 'string',
    value: '请检查输入项是否有效'
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
