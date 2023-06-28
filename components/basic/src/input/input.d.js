import Input from './Input'
export default {
  name: 'input',
  component: Input,
  icon: 'bi bi-textarea-resize',
  type: 'vanilla',
  title: '输入框',
  order: 5,
  width: 160,
  height: 28,
  props: [{
    label: '内容',
    name: 'value',
    type: 'string',
    connect: true,
    value: ''
  }, {
    label: '提示',
    name: 'placeholder',
    type: 'string',
    connect: true,
    value: '请输入文本'
  }, {
    name: 'fontFamily',
    label: '字体',
    type: 'fontFamily',
    width: '50%',
    value: 'default'
  }, {
    name: 'fontSize',
    label: '字号',
    type: 'number',
    width: '50%',
    value: 16
  }, {
    name: 'color',
    label: '颜色',
    width: '50%',
    connect: true,
    type: 'color',
    value: '#333'
  }, {
    name: 'backgroundColor',
    label: '背景色',
    width: '50%',
    connect: true,
    type: 'color'
  }, {
    name: 'borderWidth',
    label: '边框',
    type: 'number',
    width: 96,
    value: 0
  }, {
    name: 'borderStyle',
    type: 'select',
    value: 'solid',
    width: 72,
    options: [{
      label: '实线',
      value: 'solid'
    }, {
      label: '虚线',
      value: 'dashed'
    }, {
      label: '点线',
      value: 'dotted'
    }, {
      label: '双实线',
      value: 'double'
    }]
  }, {
    name: 'borderColor',
    width: 28,
    connect: true,
    type: 'color'
  }, {
    name: 'borderRadius',
    label: '圆角',
    width: '50%',
    type: 'number',
    value: 0
  }, {
    name: 'textAlign',
    label: '对齐',
    width: '50%',
    type: 'string',
    value: 'left',
    control: 'radiogroup',
    optionList: [{
      label: '靠左',
      icon: 'bi bi-text-left',
      value: 'start'
    }, {
      label: '居中',
      icon: 'bi bi-text-center',
      value: 'center'
    }, {
      label: '靠右',
      icon: 'bi bi-text-right',
      value: 'end'
    }]
  }, {
    name: 'classNames',
    label: '样式',
    type: 'class',
    value: []
  }],
  events: [{
    label: '输入值变化',
    name: 'onChange'
  }, {
    label: '按下回车键',
    name: 'onPressEnter'
  }]
}
