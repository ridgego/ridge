import FlexBoxContainer from './FlexContainer'

export default {
  name: 'flex-container',
  component: FlexBoxContainer,
  label: '弹性容器',
  type: 'vanilla',
  icon: 'IconKanban',
  props: [{
    name: 'direction',
    label: '排列方向',
    type: 'string',
    control: 'radiogroup',
    optionList: [{
      icon: 'IconSortStroked',
      rotate: 90,
      value: 'row'
    }, {
      icon: 'IconSortStroked',
      value: 'column'
    }],
    value: 'row'
  }, {
    name: 'justify',
    label: '对齐方式',
    type: 'string',
    control: 'radiogroup',
    optionList: [{
      icon: 'IconCenterLeftStroked',
      value: 'flex-start'
    }, {
      label: '正中',
      icon: 'IconCarouselStroked',
      value: 'center'
    }, {
      icon: 'IconCenterRightStroked',
      label: '底部',
      value: 'flex-end'
    }],
    value: 'flex-start'
  }, {
    name: 'alignItems',
    label: '交叉对齐',
    type: 'string',
    control: 'radiogroup',
    optionList: [{
      label: '起点对齐',
      icon: 'IconAlignHLeftStroked',
      value: 'flex-start'
    }, {
      label: '正中对齐',
      icon: 'IconAlignHCenterStroked',
      value: 'center'
    }, {
      label: '填充对齐',
      icon: 'IconSectionStroked',
      value: 'stretch'
    },
    {
      label: '终点对齐',
      icon: 'IconAlignHRightStroked',
      value: 'flex-end'
    }],
    value: 'flex-start'
  }, {
    name: 'children',
    hidden: true,
    type: 'children'
  }, {
    label: '间隔',
    name: 'gap',
    party: true,
    type: 'number',
    value: 0
  }, {
    name: 'padding',
    label: '内边',
    type: 'string',
    control: 'px4',
    value: '2px'
  }, {
    name: 'rectStyle',
    label: '块样式',
    type: 'rect',
    value: {}
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
  width: 180,
  height: 60
}
