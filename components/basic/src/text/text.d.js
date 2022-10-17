import Text from './Text'

export default {
  name: 'text',
  component: Text,
  props: [{
    name: 'text',
    type: 'string',
    event: 'input',
    value: '文本'
  }, {
    label: '样式',
    name: 'style',
    type: 'css-style',
    value: {
      fontSize: '14px'
    }
  }]
}
