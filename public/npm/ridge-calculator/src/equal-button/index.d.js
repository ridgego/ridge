import Button from './Button'
export default {
  name: 'button',
  component: Button,
  icon: 'icons/calculate.png',
  type: 'vanilla',
  title: '等于按钮',
  order: 1,
  width: 100,
  height: 100,
  props: [{
    name: 'text',
    label: '文本',
    type: 'string',
    value: '='
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }]
}
