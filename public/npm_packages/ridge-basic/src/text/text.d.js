import Text from './Text'

export default {
  name: 'text',
  component: Text,
  props: [{
    label: '内容',
    name: 'text',
    type: 'string',
    value: '文本'
  }, {
    label: '字号',
    name: 'fontSize',
    type: 'number',
    value: 14
  }, {
    label: '字体',
    name: 'font',
    type: 'array',
    control: 'font'
  }, {
    label: '换行',
    name: 'breakLines',
    type: 'string',
    control: 'word-line'
  }]
}
