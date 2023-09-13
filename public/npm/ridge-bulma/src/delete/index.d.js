import Button from './Delete'
import { size } from '../base/props'
export default {
  name: 'delete',
  title: '删除',
  component: Button,
  icon: 'IconCrossCircleStroked',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [size],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
