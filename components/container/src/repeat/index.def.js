import RepeatContainer from './index.jsx'

export default {
  name: 'repeat-container',
  component: RepeatContainer,
  props: [{
    name: 'direction',
    label: '排列方向',
    type: 'string',
    control: 'select',
    optionList: [{
      label: '横向',
      value: 'row'
    }, {
      label: '纵向',
      value: 'column'
    }],
    value: 'row'
  }, {
    name: 'justify',
    label: '对齐方式',
    type: 'string',
    control: 'select',
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
      label: '中央平分',
      value: 'space-between'
    }, {
      label: '两端平分',
      value: 'space-around'
    }],
    value: 'flex-start'
  }, {
    name: 'alignItems',
    label: '交叉对齐',
    type: 'string',
    control: 'select',
    optionList: [{
      label: '起点对齐',
      value: 'flex-start'
    }, {
      label: '终点对齐',
      value: 'flex-end'
    }, {
      label: '正中对齐',
      value: 'center'
    }, {
      label: '填充对齐',
      value: 'stretch'
    }],
    value: 'flex-start'
  }, {
    name: 'border',
    label: '边框',
    type: 'string',
    control: 'border',
    value: '1px solid #ccc'
  }, {
    name: 'padding',
    label: '内边距',
    type: 'string',
    control: 'padding',
    value: '5px'
  }],
  editorFeatures: {
    droppable: true
  }
}
