import Badge from './Badge.jsx'
export default {
  name: 'badge',
  component: Badge,
  title: '标签',
  icon: 'bi bi-info-square',
  order: 2,
  type: 'react',
  props: [{
    name: 'text',
    label: '文本',
    connect: true,
    type: 'string',
    value: '标签'
  }, {
    name: 'type',
    label: '类型',
    type: 'string',
    control: 'select',
    options: [{
      label: '主色',
      value: 'text-bg-primary'
    }, {
      label: '次要色',
      value: 'text-bg-secondary'
    }, {
      label: '成功色',
      value: 'text-bg-success'
    }, {
      label: '危险色',
      value: 'text-bg-danger'
    }]
  }, {
    name: 'icon',
    label: '图标',
    width: '50%',
    type: 'string'
  }, {
    name: 'pill',
    label: '圆形',
    width: '50%',
    type: 'boolean',
    value: false
  }, {
    name: 'showClose',
    label: '可关闭',
    width: '50%',
    type: 'boolean',
    value: false
  }, {
    name: 'classNames',
    label: '样式',
    type: 'style',
    value: []
  }],
  events: [{
    label: '点击',
    name: 'onClick'
  }, {
    label: '关闭',
    name: 'onClose'
  }],
  width: 44,
  height: 20
}
