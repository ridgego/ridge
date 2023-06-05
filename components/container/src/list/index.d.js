import ListContainer from './ListContainer'
export default {
  name: 'list-container',
  component: ListContainer,
  label: '列表容器',
  icon: 'IconCheckChoiceStroked',
  type: 'vanilla',
  props: [{
    name: 'dataSource',
    label: '数据',
    type: 'array',
    control: 'json',
    value: []
  }, {
    name: 'itemKey',
    label: '数据键',
    type: 'string',
    value: ''
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
  }],
  width: 420,
  height: 360
}
