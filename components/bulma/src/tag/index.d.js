import Tag from './Tag.js'
import { color, size, light, isDelete } from '../base/props'

const addOnColor = JSON.parse(JSON.stringify(color))
addOnColor.name = 'addonColor'
addOnColor.hidden = ({ props }) => !props.addon

export default {
  name: 'tag',
  title: '标签',
  component: Tag,
  icon: 'IconPriceTag',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'text',
    label: '文本',
    type: 'string',
    value: '标签'
  }, color, size, light, isDelete, {
    name: 'addon',
    label: '扩展',
    type: 'boolean'
  }, {
    name: 'addonText',
    label: '扩展文本',
    hidden: ({ props }) => !props.addon,
    type: 'string',
    value: '扩展'
  }, addOnColor],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
