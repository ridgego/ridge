import InlineContainer from './InlineContainer'
export default {
  name: 'inline-container',
  component: InlineContainer,
  label: '行内容器',
  type: 'vanilla',
  icon: 'bi bi-text-wrap',
  order: 2,
  props: [{
    name: 'children',
    hidden: true,
    type: 'children'
  }, {
    label: '行高',
    name: 'lineHeight',
    type: 'number',
    value: 24
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
    label: '左间距',
    field: 'style.marginLeft',
    type: 'number',
    width: '50%',
    value: 5
  }],
  width: 180,
  height: 60
}
