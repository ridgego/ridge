import FlexBoxContainer from './FlexContainer'

export default {
  name: 'flex-container',
  component: FlexBoxContainer,
  label: '弹性容器',
  type: 'vanilla',
  order: 3,
  icon: 'bi bi-layout-sidebar',
  props: [{
    name: 'direction',
    label: '排列方向',
    type: 'string',
    control: 'radiogroup',
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
    label: '排列对齐',
    type: 'string',
    control: 'radiogroup',
    optionList: [{
      label: '开始',
      value: 'flex-start'
    }, {
      label: '正中',
      value: 'center'
    }, {
      label: '结束',
      value: 'flex-end'
    }],
    value: 'flex-start'
  }, {
    name: 'alignItems',
    label: '交叉对齐',
    type: 'string',
    control: 'radiogroup',
    optionList: [{
      label: '起点',
      value: 'flex-start'
    }, {
      label: '正中',
      value: 'center'
    }, {
      label: '填充',
      value: 'stretch'
    },
    {
      label: '终点',
      value: 'flex-end'
    }],
    value: 'flex-start'
  }, {
    label: '子元素',
    name: 'children',
    hidden: true,
    type: 'children'
  }, {
    label: '间隔',
    name: 'gap',
    party: true,
    type: 'number',
    value: 8
  }],
  childStyle: [{
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
  }, {
    field: 'style.flex',
    label: '弹性',
    type: 'string',
    width: '50%'
  }, {
    field: 'style.margin',
    label: '外边距',
    type: 'string',
    width: '50%'
  }],
  width: 360,
  height: 240
}
