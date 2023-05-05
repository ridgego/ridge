import Progress from './Progress'
import { color, size, light } from '../base/props'
export default {
  name: 'progress',
  title: '进度条',
  component: Progress,
  icon: 'IconRingChartStroked',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'text',
    label: '文本',
    type: 'string',
    value: '按钮'
  }, {
    name: 'value',
    label: '进度',
    type: 'number',
    value: 10
  }, {
    name: 'max',
    label: '最大值',
    type: 'number',
    value: 100
  }, color, size, light],
  events: [],
  width: 300,
  height: 40
}
