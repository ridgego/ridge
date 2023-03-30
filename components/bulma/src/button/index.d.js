import Button from './Button'
import Icon from './button.svg'
import { color, size, light } from '../base/props'
export default {
  name: 'button',
  title: '按钮',
  component: Button,
  icon: 'IconStop',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'text',
    label: '文本',
    type: 'string',
    value: '按钮'
  }, color, size, light],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
