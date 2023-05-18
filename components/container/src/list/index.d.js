import ListContainer from './ListContainer'
import { border } from 'ridge-prop-utils'
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
    name: 'grid',
    label: '网格',
    type: 'object',
    control: 'grid',
    value: {
      enabled: false
    }
  }, {
    name: 'renderItem',
    label: '单项模板',
    type: 'slot'
  }, {
    name: 'coverContainer',
    label: '填充',
    type: 'boolean'
  }, ...border.props],
  width: 180,
  height: 60
}
