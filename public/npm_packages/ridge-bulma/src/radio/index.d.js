import Radio from './Radio.js'
export default {
  name: 'radio',
  title: '单选框',
  component: Radio,
  icon: 'IconRadio',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'value',
    label: '选中项',
    type: 'string',
    value: 'key1'
  }, {
    name: 'options',
    label: '选项列表',
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
  }],
  events: [{
    name: 'onChange',
    label: '值改变'
  }],
  width: 200,
  height: 26
}
