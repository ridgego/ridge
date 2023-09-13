import TextArea from './TextArea'
import { color, size } from '../base/props'
export default {
  name: 'textarea',
  title: '多行输入',
  component: TextArea,
  icon: 'IconModalStroked',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'value',
    label: '内容',
    type: 'string',
    value: ''
  }, {
    name: 'placeholder',
    label: '提示',
    type: 'string',
    value: '请输入内容'
  }, {
    name: 'rows',
    label: '行数',
    type: 'number',
    value: 3
  }, color, size, {
    name: 'round',
    label: '圆角',
    width: '50%',
    type: 'boolean',
    value: false
  }, {
    name: 'loading',
    label: '加载中',
    type: 'boolean',
    width: '50%',
    value: false
  }, {
    name: 'disabled',
    label: '禁用',
    type: 'boolean',
    width: '50%',
    value: false
  }, {
    name: 'readonly',
    label: '只读',
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
