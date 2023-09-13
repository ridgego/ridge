import Image from './Image'

export default {
  name: 'image',
  title: '图片',
  component: Image,
  icon: 'IconImageStroked',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'url',
    label: '图片',
    type: 'image'
  }, {
    name: 'objectFit',
    label: '大小适应',
    type: 'string',
    control: 'select',
    value: 'contain',
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
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
