import Radio from './Radio'
export default {
  name: 'radio',
  component: Radio,
  icon: 'icon/radio.svg',
  type: 'vanilla',
  title: '单选',
  order: 7,
  width: 160,
  height: 28,
  props: [{
    label: '选中',
    name: 'value',
    type: 'string',
    connect: true,
    value: ''
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
    name: 'color',
    label: '颜色',
    width: '50%',
    type: 'color'
  }, {
    name: 'direction',
    label: '横向',
    type: 'boolean',
    value: true
  }, {
    name: 'classNames',
    label: '样式',
    type: 'class',
    value: []
  }],
  events: [{
    label: '输入值变化',
    name: 'onChange'
  }]
}
