import Image from './Image.jsx'
import icon from './image.svg'

export default {
  name: 'image',
  component: Image,
  icon,
  title: '图片',
  width: 120,
  height: 90,
  props: [{
    name: 'src',
    type: 'image',
    label: '地址',
    value: ''
  }, {
    name: 'objectFit',
    label: '大小适应',
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
  }]
}
