import DropDown from './DropDown'
import { color, size, light } from '../base/props'
export default {
  name: 'dropdown',
  title: '下拉框',
  component: DropDown,
  icon: 'IconChecklistStroked',
  type: 'vanilla',
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
    item: '选项',
    value: ['选项1', '选项2', '-', '选项3']
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
