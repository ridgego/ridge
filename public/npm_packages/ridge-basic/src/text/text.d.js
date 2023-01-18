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
    label: '字号',
    name: 'fontSize',
    party: true,
    type: 'number',
    value: 14
  }, {
    label: '行高',
    name: 'lineHeight',
    type: 'number',
    value: 14
  }, {
    name: 'fontWeight',
    label: '粗细',
    type: 'string',
    control: 'radiogroup',
    optionList: [{
      label: '细',
      style: {
        fontWeight: 'lighter'
      },
      value: 'lighter'
    }, {
      label: '正常',
      style: {
        fontWeight: 'normal'
      },
      value: 'normal'
    }, {
      label: '加粗',
      style: {
        fontWeight: 'bold'
      },
      value: 'bold'
    }]
  }, {
    label: '字体',
    name: 'fontFamilly',
    type: 'font'
  }]
}
