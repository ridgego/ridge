import FlexBoxContainer from './FlowContainer'

export default {
  name: 'flow-container',
  component: FlexBoxContainer,
  label: '流式容器',
  type: 'vanilla',
  order: 3,
  icon: 'icons/flexbox.svg',
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
    label: '边框',
    name: 'border',
    type: 'border',
    value: '1px solid #ccc'
  }, {
    name: 'classNames',
    label: '样式',
    type: 'class',
    value: []
  }],
  childProps: [{
    field: 'style.margin',
    label: '外边距',
    type: 'string',
    width: '50%'
  }, {
    field: 'style.width',
    label: '长度',
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
