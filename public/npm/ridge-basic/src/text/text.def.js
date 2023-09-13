import Text from './Text'

export default {
  name: 'text',
  component: Text,
  props: [{
    name: 'text',
    type: 'string',
    value: '文本'
  }, {
    label: '字体',
    name: 'font',
    type: 'array',
    control: 'font',
    value: [12, 'normal', 1.2, 'normal']
  }, {
    label: '换行',
    name: 'line',
    type: 'array',
    control: 'word-line',
    value: [12, 'normal', 1.2, 'normal']
  }]
}
