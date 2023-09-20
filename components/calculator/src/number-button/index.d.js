import Button from './Button'
export default {
  name: 'button',
  component: Button,
  icon: 'icons/number-button.png',
  type: 'vanilla',
  title: '数字按钮',
  order: 1,
  width: 100,
  height: 100,
  props: [{
    name: 'text',
    label: '文本',
    type: 'string',
    value: '1'
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }]
}
