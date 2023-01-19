import FlexBoxContainer from './FlexContainer'
import { border } from 'ridge-prop-utils'

console.log('border', border)
export default {
  name: 'flex-container',
  component: FlexBoxContainer,
  type: 'vanilla',
  props: [{
    name: 'direction',
    label: '排列方向',
    type: 'string',
    control: 'radiogroup',
    optionList: [{
      icon: 'IconSortStroked',
      value: 'row'
    }, {
      icon: 'IconSortStroked',
      rotate: 90,
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
    label: '间隔',
    name: 'gap',
    party: true,
    type: 'number',
    value: 0
  }, {
    name: 'coverContainer',
    label: '填充',
    type: 'boolean'
  }, {
    name: 'children',
    hidden: true,
    type: 'children'
  }, ...border.props],
  childStyle: [{
    name: 'flex',
    label: '弹性',
    party: true,
    type: 'string'
  }, {
    name: 'margin',
    label: '外边距',
    type: 'string'
  }]
}
