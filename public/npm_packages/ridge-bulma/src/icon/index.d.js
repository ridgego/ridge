import Icon from './Icon'
import { colors } from '../colors/colors'
export default {
  name: 'icon',
  title: '图标',
  component: Icon,
  icon: 'IconHeartStroked',
  type: 'vanilla',
  props: [{
    name: 'icon',
    label: '图标',
    type: 'icon',
    value: ''
  }, {
    name: 'color',
    label: '颜色',
    type: 'string',
    control: 'presetcolorpicker',
    presetColors: colors,
    width: '50%'
  }, {
    name: 'backgroundColor',
    label: '背景色',
    type: 'string',
    control: 'presetcolorpicker',
    presetColors: colors,
    width: '50%'
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
