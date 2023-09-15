import Button from './Button'
export default {
  name: 'button',
  component: Button,
  icon: 'icons/back.png',
  type: 'vanilla',
  title: '操作按钮',
  order: 1,
  width: 100,
  height: 100,
  props: [],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }]
}
