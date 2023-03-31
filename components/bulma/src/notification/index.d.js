import Notification from './Notification'
import { color, size, light } from '../base/props'
export default {
  name: 'notification',
  title: '通知栏',
  component: Notification,
  icon: 'IconBellStroked',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'text',
    label: '内容',
    type: 'string',
    value: '通知正文'
  }, color, size, light, {
    name: 'hasDelete',
    label: '可关闭',
    type: 'boolean',
    width: '50%',
    value: false
  }],
  events: [{
    name: 'onClose',
    label: '关闭'
  }],
  width: 160,
  height: 80
}
