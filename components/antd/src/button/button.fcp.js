import AntdButton from './AntdButton'

export default {
  name: 'button',
  component: AntdButton,
  props: [{
    label: '标签',
    name: 'text',
    type: 'string',
    value: '按钮'
  }]
}
