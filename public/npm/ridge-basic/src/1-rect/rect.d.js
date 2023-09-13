import Rect from './Rect'

export default {
  name: 'rect',
  component: Rect,
  icon: 'bi bi-square',
  type: 'vanilla',
  title: '矩形',
  order: 1,
  width: 240,
  height: 160,
  props: [{
    name: 'borderWidth',
    label: '边框',
    type: 'number',
    width: 96,
    value: 1
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
