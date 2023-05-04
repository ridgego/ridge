import Button from './Button'
import { color, size, light } from '../base/props'
export default {
  name: 'button',
  title: '按钮',
  component: Button,
  icon: 'IconStop',
  type: 'vanilla',
  props: [{
    name: 'text',
    label: '文本',
    bindable: true,
    type: 'string',
    value: '按钮'
  }, {
    name: 'icon',
    label: '图标',
    type: 'icon',
    value: ''
  }, color, size, light],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
