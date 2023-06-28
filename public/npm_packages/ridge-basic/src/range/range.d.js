import Range from './Range'
export default {
  name: 'range',
  component: Range,
  icon: 'bi bi-sliders',
  type: 'vanilla',
  title: '滑块',
  width: 160,
  height: 28,
  props: [{
    name: 'value',
    label: '取值',
    connect: true,
    type: 'number'
  },
  {
    name: 'min',
    label: '最小值',
    width: '50%',
    type: 'number'
  },
  {
    name: 'max',
    label: '最大值',
    width: '50%',
    type: 'number'
  },
  {
    name: 'className',
    label: '样式',
    type: 'class',
    value: []
  }],
  events: [{
    label: '输入值变化',
    name: 'onChange'
  }]
}
