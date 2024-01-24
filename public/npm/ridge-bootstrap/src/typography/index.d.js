import Text from './Text.jsx'
export default {
  name: 'Text',
  title: '文本',
  component: Text,
  icon: 'icons/text-outline.svg',
  order: 4,
  type: 'react',
  props: [{
    label: '内容',
    connect: true,
    name: 'text',
    type: 'string',
    value: '文本'
  }, {
    name: 'size',
    label: '字号',
    type: 'number',
    width: '50%',
    value: 16
  }, {
    name: 'color',
    width: 28,
    type: 'color',
    value: '#333'
  }, {
    name: 'fontItalic',
    width: 28,
    type: 'boolean',
    icon: 'bi bi-type-italic'
  }, {
    name: 'strike',
    width: 28,
    type: 'boolean',
    icon: 'bi bi-type-strikethrough'
  },
  {
    name: 'weight',
    label: '字重',
    width: '50%',
    type: 'number',
    value: 400
  },
  {
    name: 'decoration',
    label: '样式',
    width: '50%',
    type: 'string',
    value: 'none',
    control: 'radiogroup',
    optionList: [{
      icon: 'bi bi-type-strikethrough',
      value: 'line-through'
    }, {
      icon: 'bi bi-text-center',
      value: 'dashed underline'
    }, {
      icon: 'bi bi-type-underline',
      value: 'underline'
    }]
  },
  {
    name: 'textAlign',
    label: '对齐',
    width: '50%',
    type: 'string',
    value: 'left',
    control: 'radiogroup',
    optionList: [{
      label: '靠左',
      icon: 'bi bi-text-left',
      value: 'start'
    }, {
      label: '居中',
      icon: 'bi bi-text-center',
      value: 'center'
    }, {
      label: '靠右',
      icon: 'bi bi-text-right',
      value: 'end'
    }]
  }, {
    name: 'verticalAlign',
    label: '垂直',
    width: '50%',
    type: 'string',
    value: 'top',
    control: 'radiogroup',
    optionList: [{
      label: '顶端',
      icon: 'bi bi-align-top',
      value: 'start'
    }, {
      label: '居中',
      icon: 'bi bi-align-middle',
      value: 'center'
    }, {
      label: '底端',
      icon: 'bi bi-align-bottom',
      value: 'end'
    }]
  }, {
    name: 'padding',
    label: '内边距',
    width: '50%',
    type: 'number',
    value: 0
  }],
  width: 100,
  height: 22
}
