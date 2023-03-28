import Button from './Button'
import { border, text } from 'ridge-prop-utils'
import Icon from './button.svg'
export default {
  name: 'button',
  component: Button,
  icon: Icon,
  type: 'vanilla',
  title: '按钮',
  width: 64,
  height: 28,
  props: [{
    name: 'text',
    label: '文本',
    type: 'string'
  }, {
    name: 'data',
    label: '数据',
    type: 'object'
  }, ...border.props, ...text.props, {
    name: 'hoverBg',
    label: '悬浮背景',
    type: 'string',
    control: 'background'
  }, {
    name: 'downBg',
    label: '点击背景',
    type: 'string',
    control: 'background'
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }]
}
