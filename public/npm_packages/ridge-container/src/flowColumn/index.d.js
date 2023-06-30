import ColumnContainer from './ColumnContainer.js'
export default {
  name: 'column-container',
  component: ColumnContainer,
  label: '多行容器',
  type: 'vanilla',
  icon: 'bi bi-text-center',
  props: [{
    name: 'children',
    hidden: true,
    type: 'children'
  }, {
    name: 'rectStyle',
    type: 'rect',
    value: {}
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
  }, {
    label: '居中',
    field: 'style.center',
    type: 'boolean',
    width: '50%',
    value: true
  }, {
    label: '横向占满',
    field: 'style.fullwidth',
    type: 'boolean',
    width: '50%',
    value: true
  }, {
    label: '上边距',
    field: 'style.marginTop',
    type: 'number',
    width: '50%',
    value: '10'
  }],
  width: 360,
  height: 120
}
