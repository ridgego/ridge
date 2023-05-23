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
    value: 'bi bi-archive'
  }, {
    name: 'color',
    label: '颜色',
    type: 'string',
    control: 'colorpicker',
    width: '50%'
  }, {
    name: 'backgroundColor',
    label: '背景色',
    type: 'string',
    control: 'colorpicker',
    width: '50%'
  }, {
    name: 'size',
    label: '大小',
    type: 'number',
    width: '50%',
    value: 24
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 36,
  height: 36
}
