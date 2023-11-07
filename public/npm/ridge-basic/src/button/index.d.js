import Button from './Button'
export default {
  name: 'button',
  component: Button,
  icon: 'icon/button.svg',
  type: 'vanilla',
  title: '按钮',
  order: 4,
  width: 64,
  height: 28,
  props: [{
    name: 'text',
    label: '文本',
    type: 'string',
    value: '按钮'
  }, {
    name: 'classNames',
    label: '样式',
    type: 'class',
    value: []
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }]
}
