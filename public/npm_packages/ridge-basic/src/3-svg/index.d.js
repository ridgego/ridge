import Icon from './Icon'

export default {
  name: 'icon',
  component: Icon,
  type: 'vanilla',
  icon: 'bi bi-bag',
  title: '图标',
  width: 64,
  height: 64,
  props: [{
    name: 'src',
    type: 'icon',
    label: '图标',
    value: ''
  }, {
    name: 'color',
    label: '颜色',
    type: 'string',
    control: 'colorpicker'
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }]
}
