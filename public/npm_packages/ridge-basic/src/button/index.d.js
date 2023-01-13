import Button from './Button'

export default {
  name: 'button',
  component: Button,
  type: 'vanilla',
  props: [{
    name: 'text',
    label: '文本',
    type: 'string'
  },
  {
    name: 'border',
    label: '边框',
    type: 'string',
    control: 'border',
    value: '1px solid #ccc'
  }, {
    label: '圆角',
    name: 'borderRadius',
    type: 'number',
    value: 0
  }, {
    name: 'color',
    label: '颜色',
    type: 'string',
    control: 'colorpicker'
  }, {
    name: 'backgroundColor',
    label: '背景色',
    type: 'string',
    control: 'colorpicker'
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }]
}
