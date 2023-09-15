import ListContainer from './ListContainer'
export default {
  name: 'list-container',
  component: ListContainer,
  label: '列表容器',
  icon: 'bi bi-view-stacked',
  type: 'vanilla',
  props: [{
    name: 'dataSource',
    label: '数据',
    type: 'array',
    connect: true,
    control: 'json',
    value: []
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
    name: 'renderItem',
    label: '单项模板',
    type: 'slot'
  }, {
    name: 'coverContainer',
    label: '填充',
    type: 'boolean'
  }, {
    name: 'classNames',
    label: '样式',
    type: 'class',
    value: []
  }],
  width: 420,
  height: 360
}
