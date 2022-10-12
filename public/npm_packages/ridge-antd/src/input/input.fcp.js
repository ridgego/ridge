import AntdIutton from './AntdInput'

export default {
  name: 'button',
  component: () => AntdIutton,
  props: [{
    name: 'placeholder',
    type: 'string',
    value: '请输入内容'
  }]
}
