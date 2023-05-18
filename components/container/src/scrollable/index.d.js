import ScrollContainer from './ScrollContainer'

export default {
  name: 'scroll-container',
  component: ScrollContainer,
  label: '滚动容器',
  type: 'vanilla',
  icon: 'IconFingerLeftStroked',
  props: [{
    label: '横向滚动',
    name: 'overflowX',
    type: 'boolean',
    value: true
  }, {
    label: '纵向滚动',
    name: 'overflowY',
    type: 'boolean',
    value: true
  }, {
    label: '自动滚动',
    name: 'animation',
    type: 'boolean',
    value: false
  }, {
    name: 'children',
    hidden: true,
    type: 'children'
  }],
  childStyle: [{
    label: 'W',
    width: '50%',
    control: 'number',
    field: 'style.width',
    fieldEx: 'styleEx.width'
  }, {
    label: 'H',
    width: '50%',
    control: 'number',
    field: 'style.height',
    fieldEx: 'styleEx.height'
  }],
  width: 540,
  height: 360
}
