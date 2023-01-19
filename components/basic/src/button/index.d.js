import Button from './Button'
import { border } from 'ridge-prop-utils'

export default {
  name: 'button',
  component: Button,
  type: 'vanilla',
  props: [{
    name: 'text',
    label: '文本',
    type: 'string'
  }, {
    name: 'color',
    label: '颜色',
    type: 'string',
    control: 'colorpicker'
  }, ...border.props],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }]
}
