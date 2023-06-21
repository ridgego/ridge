import Image from './Image.js'

export default {
  name: 'image',
  component: Image,
  icon: 'bi bi-image',
  title: '图片',
  type: 'vanilla',
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
    }]
  }, {
    name: 'borderRadius',
    label: '圆角',
    type: 'padding',
    position: 'corner',
    value: '0 0 0 0'
  }, {
    name: 'border',
    label: '边框',
    type: 'border',
    value: '0px solid #CCC'
  }, {
    name: 'className',
    label: '样式',
    type: 'class',
    value: []
  }]
}
