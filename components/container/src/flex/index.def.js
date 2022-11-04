import FlexBoxContainer from './index.jsx'

export default {
  name: 'flex-container',
  component: FlexBoxContainer,
  props: [{
    name: 'direction',
    label: '方向',
    type: 'select',
    optionList: [{
      label: '横向',
      value: 'row'
    }, {
      label: '纵向',
      value: 'column'
    }],
    value: 'row'
  }, {
    name: 'alignItems',
    label: '对齐',
    type: 'select',
    optionList: [{
      label: '顶端',
      value: 'flex-start'
    }, {
      label: '底部',
      value: 'flex-end'
    }, {
      label: '正中',
      value: 'center'
    }, {
      label: '拉伸',
      value: 'stretch'
    }],
    value: 'flex-start'
  }, {
    name: 'border',
    label: '边框',
    type: 'border',
    value: '1px solid #ccc'
  }],
  editorFeatures: {
    droppable: true
  }
}
