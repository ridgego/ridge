import InlineContainer from './InlineContainer'
export default {
  name: 'inline-container',
  component: InlineContainer,
  label: '行内容器',
  type: 'vanilla',
  icon: 'IconTestScoreStroked',
  props: [{
    name: 'children',
    hidden: true,
    type: 'children'
  }, {
    name: 'rectStyle',
    label: '块样式',
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
    label: '横向占满',
    field: 'style.fullwidth',
    type: 'boolean',
    width: '50%',
    value: true
  }],
  width: 180,
  height: 60
}
