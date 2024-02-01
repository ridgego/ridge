import SwitchContainer from './SwitchContainer.js'
export default {
  name: 'switch-container',
  component: SwitchContainer,
  label: '内容切换',
  type: 'vanilla',
  order: 7,
  icon: 'bi bi-layers-half',
  props: [{
    name: 'current',
    label: '当前内容',
    connect: true,
    type: 'number',
    value: 0
  }, {
    name: 'preload',
    label: '预加载',
    type: 'boolean',
    value: true
  }, {
    name: 'classNames',
    label: '样式',
    type: 'class',
    value: []
  }, {
    name: 'children',
    hidden: true,
    type: 'children',
    value: []
  }],
  width: 540,
  height: 360
}
