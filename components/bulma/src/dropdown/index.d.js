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
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
