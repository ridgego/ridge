import RelativeContainer from './RelativeContainer.js'
export default {
  name: 'relative-container',
  component: RelativeContainer,
  label: '相对容器',
  type: 'vanilla',
  order: 4,
  icon: 'bi bi-pip',
  props: [{
    name: 'children',
    hidden: true,
    type: 'children'
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
    label: '距左',
    width: '50%',
    control: 'string',
    field: 'style.left'
  }, {
    label: '距上',
    width: '50%',
    control: 'string',
    field: 'style.top'
  }, {
    label: '距右',
    width: '50%',
    control: 'string',
    field: 'style.right'
  }, {
    label: '距下',
    width: '50%',
    control: 'string',
    field: 'style.bottom'
  }, {
    label: '宽度',
    width: '50%',
    control: 'number',
    field: 'style.width',
    fieldEx: 'styleEx.width'
  }, {
    label: '高度',
    width: '50%',
    control: 'number',
    field: 'style.height',
    fieldEx: 'styleEx.height'
  }],
  width: 540,
  height: 360
}
