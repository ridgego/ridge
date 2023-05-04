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
    name: 'rounded',
    label: '圆形',
    type: 'boolean'
  }, {
    name: 'url',
    label: '图片',
    type: 'image'
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
