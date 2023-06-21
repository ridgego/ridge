import Button from './Button'
export default {
  name: 'button',
  component: Button,
  icon: 'bi bi-pause-btn',
  type: 'vanilla',
  title: '按钮',
  width: 64,
  height: 28,
  props: [{
    name: 'text',
    label: '文本',
    type: 'string',
    value: '按钮'
  }, {
    name: 'className',
    label: '样式',
    type: ''
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }]
}
