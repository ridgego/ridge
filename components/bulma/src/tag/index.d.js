import Tag from './Tag.js'
import { color, size, light, isDelete } from '../base/props'

const addOnColor = JSON.parse(JSON.stringify(color))
addOnColor.name = 'addonColor'

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
  }, color, {
    name: 'size',
    label: '大小',
    type: 'string',
    control: 'select',
    value: 'is-normal',
    width: '50%',
    optionList: [{
      label: '小号',
      value: 'is-normal'
    },
    {
      label: '普通',
      value: 'is-medium'
    },
    {
      label: '大号',
      value: 'is-large'
    }]
  }, light, isDelete, {
    name: 'addon',
    label: '扩展',
    type: 'boolean'
  }, {
    name: 'addonText',
    label: '扩展文本',
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
