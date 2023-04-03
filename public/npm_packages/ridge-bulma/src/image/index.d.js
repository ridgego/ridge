import Image from './Image'
import { color, size } from '../base/props'

const sizes = ['16', '24', '32', '48', '64', '96', '128']

export default {
  name: 'image',
  title: '图片',
  component: Image,
  icon: 'IconImageStroked',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'size',
    label: '固定尺寸',
    type: 'string',
    control: 'select',
    value: 'is-normal',
    optionList: sizes.map(v => ({
      label: v + 'x' + v,
      value: 'is-' + v + 'x' + v
    }))
  }, {
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
