import Select from './Select'
import { color, size } from '../base/props'
export default {
  name: 'select',
  title: '下拉输入',
  component: Select,
  icon: 'IconServer',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'value',
    label: '取值',
    connect: true,
    type: 'string',
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
    name: 'placeholder',
    label: '提示',
    type: 'string',
    value: '请输入内容'
  }, color, size, {
    name: 'round',
    label: '圆角',
    width: '50%',
    type: 'boolean',
    value: false
  }, {
    name: 'disabled',
    label: '禁用',
    type: 'boolean',
    width: '50%',
    value: false
  }],
  events: [{
    name: 'onChange',
    label: '值改变'
  }],
  width: 160,
  height: 40
}
