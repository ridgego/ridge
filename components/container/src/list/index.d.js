import ListContainer from './ListContainer'
export default {
  name: 'list-container',
  component: ListContainer,
  label: '列表容器',
  icon: 'icons/list.svg',
  type: 'vanilla',
  props: [{
    name: 'dataSource',
    label: '数据',
    type: 'array',
    connect: true,
    control: 'json',
    value: []
  }, {
    name: 'value',
    label: '当前选中',
    type: 'number'
  }, {
    name: 'itemLayout',
    label: '布局',
    type: 'string',
    control: 'select',
    optionList: [{
      label: '纵向',
      value: 'vertical'
    }, {
      label: '横向',
      value: 'horizontal'
    }],
    value: 'vertical'
  }, {
    label: '间隔',
    name: 'gap',
    width: '50%',
    type: 'number',
    value: 8
  }, {
    label: '内边距',
    name: 'padding',
    width: '50%',
    type: 'number',
    value: 8
  }, {
    label: '边框',
    name: 'border',
    type: 'border',
    value: '1px solid #ddd'
  }, {
    name: 'children',
    type: 'children',
    slot: ['item']
  }, {
    name: 'classNames',
    label: '样式',
    type: 'class',
    value: []
  }],
  childProps: [{
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
  width: 420,
  height: 360
}
