import CheckBox from './Badge.jsx'
export default {
  name: 'badge',
  title: '徽章',
  component: CheckBox,
  icon: 'icons/checkbox.svg',
  order: 2,
  type: 'react',
  props: [{
    name: 'text',
    label: '文本',
    connect: true,
    type: 'string',
    value: '切换选项'
  }, {
    name: 'value',
    label: '选中',
    connect: true,
    type: 'boolean'
  },
  {
    name: 'size',
    label: '字体大小',
    type: 'number',
    width: '50%',
    value: 14
  }, {
    name: 'disabled',
    label: '禁用',
    width: '50%',
    type: 'boolean',
    value: false
  }, {
    name: 'classNames',
    label: '样式',
    type: 'array',
    control: 'tree',
    treeData: async () => {
      return import(/* webpackChunkName: "bootStyleList" */ '../styleList.js')
    }
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 32
}
