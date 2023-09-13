import Input from './Input'
import { color, size } from '../base/props'
export default {
  name: 'input',
  title: '输入框',
  component: Input,
  icon: 'IconEdit2Stroked',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'value',
    label: '内容',
    connect: true,
    type: 'string',
    value: ''
  }, size, color, {
    name: 'placeholder',
    label: '提示',
    type: 'string',
    value: '请输入内容'
  }, {
    name: 'round',
    label: '圆角',
    width: '50%',
    type: 'boolean',
    value: false
  }, {
    name: 'loading',
    label: '加载中',
    bindable: true,
    type: 'boolean',
    width: '50%',
    value: false
  }, {
    name: 'disabled',
    label: '禁用',
    bindable: true,
    type: 'boolean',
    width: '50%',
    value: false
  }, {
    name: 'readonly',
    label: '只读',
    bindable: true,
    type: 'boolean',
    width: '50%',
    value: false
  }, {
    name: 'iconBefore',
    label: '前图标',
    width: '50%',
    type: 'icon'
  }, {
    name: 'iconAfter',
    label: '后图标',
    width: '50%',
    type: 'icon'
  }],
  events: [{
    name: 'onChange',
    label: '值改变'
  }],
  width: 160,
  height: 40
}
