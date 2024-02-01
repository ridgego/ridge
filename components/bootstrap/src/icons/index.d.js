import Icon from './Icon.jsx'
export default {
  name: 'Icons',
  title: '图标',
  component: Icon,
  icon: 'bi bi-emoji-smile',
  order: 1,
  type: 'react',
  props: [{
    name: 'icon',
    label: '图标',
    connect: true,
    type: 'string',
    value: 'bi-bag-check'
  }, {
    name: 'color',
    label: '颜色',
    connect: true,
    type: 'string',
    control: 'color'
  }, {
    name: 'size',
    label: '字体大小',
    type: 'number',
    width: '50%',
    value: 18
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
