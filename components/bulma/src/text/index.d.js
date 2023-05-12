import Text from './Text'
export default {
  name: 'text',
  title: '文本',
  component: Text,
  icon: 'IconTextRectangle',
  type: 'vanilla',
  props: [{
    name: 'text',
    label: '内容',
    bindable: true,
    type: 'string',
    value: '文字'
  }, {
    name: 'padding',
    label: '内边距',
    bindable: false,
    type: 'padding',
    value: '0 0 0 0'
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
