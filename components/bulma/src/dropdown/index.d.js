import DropDown from './DropDown'
import { color, size, light } from '../base/props'
export default {
  name: 'dropdown',
  title: '下拉选项',
  component: DropDown,
  icon: 'IconChevronDown',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'text',
    label: '文本',
    type: 'string',
    value: '按钮'
  }, {
    name: 'hoverable',
    label: '自动下拉',
    type: 'boolean',
    value: true
  }, {
    name: 'menus',
    label: '下拉列表',
    type: 'array',
    value: []
  }, {
    name: 'value',
    label: '活动项',
    type: 'string',
    value: ''
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
