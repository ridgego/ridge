import AntdIut from './AntdInput'

export default {
  name: 'input',
  component: AntdIut,
  props: [{
    name: 'placeholder',
    type: 'string',
    value: '请输入内容'
  }]
}
