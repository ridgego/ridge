import Composite from './CompositeWrapper'

export default {
  name: 'composite',
  component: Composite,
  title: '组合',
  icon: 'bi bi-box-seam',
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
    type: 'page'
  }],
  events: [],
  requiredProperties: ['ridge', 'composite']
}
