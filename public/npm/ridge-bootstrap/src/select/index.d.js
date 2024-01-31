import Select from './Select.jsx'
export default {
  name: 'Select',
  component: Select,
  title: '下拉选择',
  icon: 'bi bi-menu-button',
  order: 1,
  type: 'react',
  props: [{
    name: 'value',
    label: '内容',
    connect: true,
    type: 'string',
    value: ''
  }, {
    name: 'options',
    label: '选项',
    connect: true,
    type: 'array',
    item: {
      label: '选项1',
      value: 'value1'
    },
    value: []
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
    label: '尺寸',
    type: 'string',
    control: 'select',
    width: '50%',
    options: [{
      label: '小',
      value: 'form-select-sm'
    }, {
      label: '正常',
      value: ''
    }, {
      label: '大',
      value: 'form-select-lg'
    }]
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
