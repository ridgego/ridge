import FlowContainer from './FlowContainer'

export default {
  name: 'flow-container',
  component: FlowContainer,
  label: '文档流',
  type: 'vanilla',
  order: 3,
  icon: 'bi bi-text-wrap',
  props: [{
    name: 'children',
    hidden: true,
    type: 'children'
  }, {
    label: '间隔',
    name: 'gap',
    width: '50%',
    type: 'number',
    value: 8
  }, {
    label: '内边距',
    name: 'padding',
    type: 'number',
    value: 0
  }, {
    name: 'classNames',
    label: '样式',
    type: 'class',
    value: []
  }],
  childProps: [{
    field: 'style.width',
    label: '宽度',
    type: 'string',
    width: '50%'
  }, {
    field: 'style.height',
    label: '高度',
    type: 'string',
    width: '50%'
  }, {
    field: 'style.margin',
    label: '外边距',
    type: 'string',
    width: '50%'
  }, {
    field: 'style.block',
    label: '块级',
    type: 'boolean',
    width: '50%'
  }],
  width: 360,
  height: 240
}
