import Icon from './Icon'
import { color, size, light } from '../base/props'
export default {
  name: 'icon',
  title: '图标',
  component: Icon,
  icon: 'IconStop',
  type: 'vanilla',
  props: [{
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
