import ListContainer from './index.jsx'
import bordered from '../bordered.d'
export default {
  name: 'repeat-container',
  component: ListContainer,
  props: [{
    name: 'listData',
    label: '列表数据',
    type: 'array',
    control: 'textarea',
    format: ['json'],
    value: []
  },
  {
    name: 'itemHeihgt',
    label: '单项高度',
    type: 'boolean',
    control: 'switch',
    checkedText: ['自动', '固定'],
    value: true
  }, {
    name: 'itemWidth',
    label: '单项宽度',
    type: 'boolean',
    control: 'switch',
    checkedText: ['自动', '固定'],
    value: true
  }, ...bordered.props],
  editorFeatures: {
    droppable: true
  }
}
