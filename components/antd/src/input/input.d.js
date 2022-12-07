import AntdIut from './AntdInput'

export default {
  name: 'input',
  component: AntdIut,
  props: [{
    label: '取值',
    name: 'value',
    type: 'string',
    value: ''
  }, {
    label: '尺寸',
    name: 'size',
    type: 'string',
    value: '',
    control: 'select',
    optionList: [{
      label: '大',
      value: 'large'
    }, {
      label: '默认',
      value: 'default'
    }, {
      label: '小',
      value: 'small'
    }]
  }, {
    label: '校验状态',
    name: 'status',
    type: 'string',
    value: '',
    control: 'select',
    optionList: [{
      label: '错误',
      value: 'error'
    }, {
      label: '警告',
      value: 'warning'
    }]
  }, {
    label: '空白提示',
    name: 'placeholder',
    type: 'string',
    value: '请输入内容'
  }, {
    label: '字数提示',
    name: 'showCount',
    type: 'boolean',
    value: false
  }],
  events: [{
    label: '输入值变化',
    name: 'onChange'
  }, {
    label: '按下回车键',
    name: 'onPressEnter'
  }],
  feature: {
    slotable: true
  }
}
