import Composite from './CompositeWrapper'

export default {
  name: 'composite',
  component: Composite,
  icon: 'icon/composite.png',
  type: 'vanilla',
  order: 9,
  width: 150,
  height: 60,
  props: [{
    name: 'app',
    label: '程序包名',
    type: 'string'
  }, {
    name: 'page',
    label: '组件路径',
    type: 'string'
  }],
  events: [],
  requiredProperties: ['ridge']
}
