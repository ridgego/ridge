import Button from './Button.jsx'
import { color, size, light, outlined } from '../base/props'
export default {
  name: 'button',
  title: '按钮',
  component: Button,
  icon: 'icons/button.svg',
  order: 1,
  type: 'react',
  props: [{
    name: 'text',
    label: '文本',
    bindable: true,
    type: 'string',
    value: '按钮'
  }, size, color, light, outlined, {
    name: 'loading',
    label: '加载中',
    width: '50%',
    type: 'boolean',
    value: false
  }, {
    name: 'round',
    label: '圆角',
    width: '50%',
    type: 'boolean',
    value: false
  }, {
    name: 'disabled',
    label: '禁用',
    width: '50%',
    type: 'boolean',
    value: false
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
