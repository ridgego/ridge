import CheckBox from './CheckBox.jsx'
export default {
  name: 'checkbox',
  title: '切换选框',
  component: CheckBox,
  icon: 'bi bi-check2-square',
  order: 2,
  type: 'react',
  props: [{
    name: 'text',
    label: '文本',
    connect: true,
    type: 'string',
    value: '切换选项'
  }, {
    name: 'value',
    label: '选中',
    connect: true,
    type: 'boolean'
  },
  {
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
  height: 32
}
