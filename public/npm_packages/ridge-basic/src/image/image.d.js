import Image from './Image.js'

export default {
  name: 'image',
  component: Image,
  icon: 'bi bi-image',
  title: '图片',
  type: 'vanilla',
  order: 3,
  width: 260,
  height: 160,
  props: [{
    name: 'src',
    type: 'image',
    label: '地址',
    value: ''
  }, {
    name: 'objectFit',
    label: '自适应',
    type: 'string',
    control: 'select',
    optionList: [{
      label: '拉伸填充',
      value: 'fill'
    }, {
      label: '裁剪填充',
      value: 'cover'
    }, {
      label: '按比例缩放',
      value: 'contain'
    }, {
      label: '原尺寸',
      value: 'none'
    }],
    value: 'cover'
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
    name: 'borderRadius',
    label: '圆角',
    width: '50%',
    type: 'string',
    value: '0px'
  }, {
    name: 'fillColor',
    label: '填充色',
    width: '50%',
    type: 'color'
  }, {
    name: 'className',
    label: '样式',
    type: 'class',
    value: []
  }]
}
