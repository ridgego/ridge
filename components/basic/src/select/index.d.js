import Select from './Select'
export default {
  name: 'select',
  component: Select,
  icon: 'bi bi-menu-button',
  type: 'vanilla',
  title: '下拉框',
  order: 8,
  width: 160,
  height: 28,
  props: [{
    label: '选中',
    name: 'value',
    type: 'string',
    connect: true,
    value: ''
  }, {
    name: 'placeholder',
    label: '提示',
    type: 'string',
    value: '请输入内容'
  }, {
    name: 'options',
    label: '选项',
    type: 'array',
    item: {
      label: '选项',
      value: 'key'
    },
    value: [{
      label: '选项1',
      value: 'key1'
    }, {
      label: '选项2',
      value: 'key2'
    }, {
      label: '选项3',
      value: 'key3'
    }]
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
    name: 'color',
    label: '颜色',
    width: '50%',
    type: 'color'
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
