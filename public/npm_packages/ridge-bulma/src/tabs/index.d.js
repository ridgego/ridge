import Tabs from './Tabs.js'
import { size } from '../base/props'

export default {
  name: 'tabs',
  title: '切换',
  component: Tabs,
  icon: 'IconTabsStroked',
  type: 'vanilla',
  adjustSize: 'all',
  resizable: false,
  props: [{
    name: 'value',
    label: '选中',
    connect: true,
    type: 'string'
  }, {
    name: 'align',
    label: '对齐',
    type: 'string',
    control: 'radiogroup',
    optionList: [{
      label: '靠左',
      value: 'is-left'
    }, {
      label: '居中',
      value: 'is-centered'
    }, {
      label: '靠右',
      value: 'is-right'
    }],
    value: ''
  }, {
    name: 'style',
    label: '样式',
    type: 'string',
    control: 'radiogroup',
    optionList: [{
      label: '默认',
      value: ''
    }, {
      label: '页签',
      value: 'is-boxed'
    }, {
      label: '切换',
      value: 'is-toggle'
    }, {
      label: '圆角切换',
      value: 'is-toggle-rounded'
    }],
    value: ''
  }, size, {
    name: 'full',
    label: '填充',
    type: 'boolean',
    value: false
  }, {
    name: 'tabs',
    label: '列表',
    type: 'array',
    item: {
      label: '选项',
      value: 'key'
    },
    value: [{
      label: '图片',
      value: 'pictures'
    }, {
      label: '音乐',
      value: 'musics'
    }, {
      label: '视频',
      value: 'videos'
    }]
  }],
  events: [{
    label: '切换',
    name: 'onTabChange'
  }],
  width: 360,
  height: 40
}
