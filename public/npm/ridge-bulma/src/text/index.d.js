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
    connect: true,
    type: 'string',
    value: '文字'
  }, {
    name: 'fontStyle',
    label: '样式',
    type: 'font',
    value: {}
  }],
  events: [],
  width: 160,
  height: 32
}
