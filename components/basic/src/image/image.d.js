import Image from './Image.js'

export default {
  name: 'image',
  component: Image,
  icon: 'icon/image.svg',
  title: '图片',
  type: 'vanilla',
  order: 3,
  width: 260,
  height: 160,
  props: [{
    name: 'src',
    type: 'image',
    label: '地址',
    connect: true,
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
    name: 'border',
    label: '边框',
    type: 'border'
  }, {
    name: 'borderRadius',
    label: '圆角',
    width: '50%',
    type: 'string',
    value: '0px'
  }, {
    name: 'className',
    label: '样式',
    type: 'class',
    value: []
  }]
}
