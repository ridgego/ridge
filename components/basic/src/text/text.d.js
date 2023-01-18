import Text from './Text.js'

export default {
  name: 'text',
  type: 'vanilla',
  component: Text,
  props: [{
    label: '内容',
    name: 'text',
    type: 'string',
    value: '文本'
  }, {
    name: 'color',
    label: '颜色',
    type: 'string',
    control: 'colorpicker'
  }, {
    name: 'fontWeight',
    label: '粗细',
    type: 'string',
    control: 'fontWeight'
  }, {
    label: '字号',
    name: 'fontSize',
    type: 'number',
    value: 14
  }, {
    label: '字体',
    name: 'fontFamilly',
    type: 'font'
  }, {
    label: '换行',
    name: 'breakLines',
    type: 'string',
    control: 'word-line'
  }]
}
