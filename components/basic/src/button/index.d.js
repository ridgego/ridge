import Button from './Button'
export default {
  name: 'button',
  component: Button,
  icon: 'icon/button.svg',
  type: 'vanilla',
  title: '按钮',
  order: 4,
  width: 64,
  height: 28,
  props: [{
    name: 'text',
    label: '文本',
    type: 'string',
    value: '按钮'
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
    name: 'backgroundColor',
    label: '背景色',
    width: '50%',
    type: 'color'
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
    type: 'color'
  }, {
    name: 'borderRadius',
    label: '圆角',
    width: '50%',
    type: 'string',
    value: '0px'
  }, {
    name: 'classNames',
    label: '样式',
    type: 'class',
    value: []
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }]
}
