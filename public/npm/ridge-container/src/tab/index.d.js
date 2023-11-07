import SwitchContainer from './SwitchContainer.js'
export default {
  name: 'switch-container',
  component: SwitchContainer,
  label: '切换容器',
  type: 'vanilla',
  order: 7,
  icon: 'icons/switch.svg',
  props: [{
    name: 'states',
    label: '状态',
    connect: 'current',
    type: 'states',
    value: {
      current: 'State1',
      list: ['State1', 'State2']
    }
  }, {
    name: 'effect',
    label: '切换效果',
    type: 'string',
    control: 'select',
    optionList: [{
      label: '无效果',
      value: 'none'
    }, {
      label: '横向平移',
      value: 'v-slide'
    }, {
      label: '纵向平移',
      value: 'h-slide'
    }, {
      label: '渐变',
      value: 'fade'
    }],
    value: 'none'
  }, {
    name: 'preload',
    label: '预加载',
    type: 'boolean',
    value: true
  }, {
    name: 'classNames',
    label: '样式',
    type: 'class',
    value: []
  }, {
    name: 'children',
    hidden: true,
    type: 'children',
    value: []
  }],
  childStyle: [],
  width: 540,
  height: 360
}
