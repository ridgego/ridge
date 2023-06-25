import Text from './Text.js'
export default {
  name: 'text',
  title: '文本',
  type: 'vanilla',
  icon: 'bi bi-fonts',
  width: 100,
  height: 32,
  component: Text,
  props: [{
    label: '内容',
    connect: true,
    name: 'text',
    type: 'string',
    value: '文本'
  }, {
    label: '对齐',
    name: 'textAlign',
    type: 'string',
    value: 'left',
    control: 'radiogroup',
    bindable: false,
    optionList: [{
      label: '靠左',
      value: 'left'
    }, {
      label: '居中',
      value: 'center'
    }, {
      label: '靠右',
      value: 'right'
    }]
  }, {
    label: '字体',
    name: 'font',
    type: 'font',
    value: {}
  }]
}
