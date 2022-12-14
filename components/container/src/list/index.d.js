import ListContainer from './ListContainer'
export default {
  name: 'list-container',
  component: ListContainer,
  type: 'vanilla',
  props: [{
    name: 'dataSource',
    label: '数据',
    type: 'array',
    control: 'json-editor',
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
    name: 'grid',
    label: '网格',
    type: 'object',
    control: 'grid',
    value: {
      enabled: false
    }
  }]
}
