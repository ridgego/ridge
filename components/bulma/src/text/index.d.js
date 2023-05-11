import Text from './Text'
export default {
  name: 'text',
  title: '文本',
  component: Text,
  icon: 'IconComponentStroked',
  type: 'vanilla',
  props: [{
    name: 'text',
    label: '内容',
    bindable: true,
    type: 'string',
    value: ''
  }, {
    name: 'fontStyle',
    label: '样式',
    type: 'font',
    value: {}
  }],
  events: [],
  width: 160,
  height: 40
}
