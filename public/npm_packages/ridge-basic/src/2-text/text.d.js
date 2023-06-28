import Text from './Text.js'
export default {
  name: 'text',
  title: '文本',
  type: 'vanilla',
  icon: 'bi bi-fonts',
  order: 2,
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
    name: 'fontFamily',
    label: '字体',
    type: 'fontFamily',
    width: '50%',
    value: 'default'
  }, {
    name: 'fontSize',
    label: '字号',
    type: 'number',
    width: '50%',
    value: 16
  }, {
    name: 'color',
    label: '颜色',
    width: '50%',
    type: 'color',
    value: '#333'
  }, {
    name: 'fontWeight',
    label: '样式',
    width: 80,
    type: 'boolean',
    icon: 'bi bi-type-bold'
  },
  {
    name: 'fontItalic',
    width: 28,
    type: 'boolean',
    icon: 'bi bi-type-italic'
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
    name: 'borderWidth',
    label: '边框',
    type: 'number',
    width: 96,
    value: 0
  }, {
    name: 'borderStyle',
    type: 'select',
    value: 'solid',
    width: 72,
    options: [{
      label: '实线',
      value: 'solid'
    }, {
      label: '虚线',
      value: 'dashed'
    }, {
      label: '点线',
      value: 'dotted'
    }, {
      label: '双实线',
      value: 'double'
    }]
  }, {
    name: 'borderColor',
    width: 28,
    type: 'color',
    value: '#AAA'
  }, {
    name: 'padding',
    label: '内边',
    width: '50%',
    type: 'string',
    value: '0 0 0 0'
  }, {
    name: 'borderRadius',
    label: '圆角',
    width: '50%',
    type: 'string',
    value: '0px'
  }, {
    name: 'backgroundColor',
    label: '背景色',
    width: '40%',
    type: 'color'
  }, {
    name: 'backgroundImage',
    label: '图片',
    width: '60%',
    type: 'image'
  }]
}
