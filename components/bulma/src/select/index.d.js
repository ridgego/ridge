import Select from './Select'
import { color, size } from '../base/props'
export default {
  name: 'select',
  title: '下拉选项',
  component: Select,
  icon: 'IconServer',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'value',
    label: '取值',
    type: 'string',
    value: ''
  }, {
    name: 'options',
    label: '选项',
    type: 'array',
    value: []
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
