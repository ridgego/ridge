import SwitchContainer from './SwitchContainer.js'
export default {
  name: 'switch-container',
  component: SwitchContainer,
  label: '切换容器',
  type: 'vanilla',
  order: 7,
  icon: 'bi bi-pip',
  props: [{
    name: 'states',
    label: '状态',
    type: 'states',
    value: []
  }, {
    name: 'children',
    hidden: true,
    type: 'children'
  }],
  childStyle: [],
  width: 540,
  height: 360
}
