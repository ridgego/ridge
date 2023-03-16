import Button from './Button'
import { border, text } from 'ridge-prop-utils'

export default {
  name: 'button',
  component: Button,
  type: 'vanilla',
  props: [{
    name: 'text',
    label: '文本',
    type: 'string'
  }, ...border.props, ...text.props],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }]
}
