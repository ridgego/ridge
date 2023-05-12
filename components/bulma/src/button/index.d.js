import Button from './Button'
import { color, size, light } from '../base/props'
export default {
  name: 'button',
  title: '按钮',
  component: Button,
  icon: 'IconButtonStroked',
  type: 'vanilla',
  props: [{
    name: 'text',
    label: '文本',
    bindable: true,
    type: 'string',
    value: '按钮'
  }, {
    name: 'fontStyle',
    label: '样式',
    type: 'font',
    value: {}
  }, {
    name: 'iconBefore',
    type: 'slot'
  }, {
    name: 'iconAfter',
    type: 'slot'
  }, color, light],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  childStyle: [{
    label: 'W',
    width: '50%',
    control: 'number',
    field: 'style.width'
  }, {
    label: 'H',
    width: '50%',
    control: 'number',
    field: 'style.height'
  }],
  width: 80,
  height: 40
}
