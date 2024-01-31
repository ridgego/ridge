import Button from './Button.jsx'
export default {
  name: 'button',
  title: '按钮',
  component: Button,
  icon: 'bi bi-play-btn',
  order: 1,
  type: 'react',
  props: [{
    name: 'text',
    label: '文本',
    connect: true,
    type: 'string',
    value: '按钮'
  }, {
    name: 'type',
    label: '类型',
    type: 'string',
    control: 'select',
    value: 'primary',
    optionList: [{
      label: '主要',
      value: 'primary'
    },
    {
      label: '次要',
      value: 'secondary'
    },
    {
      label: '成功',
      value: 'success'
    },
    {
      label: '危险',
      value: 'danger'
    },
    {
      label: '警告',
      value: 'warning'
    },
    {
      label: '链接',
      value: 'link'
    },
    {
      label: '信息',
      value: 'info'
    },
    {
      label: '亮',
      value: 'light'
    },
    {
      label: '暗',
      value: 'dark'
    }],
    width: '50%'
  }, {
    name: 'outline',
    label: '细边',
    width: '50%',
    type: 'boolean'
  }, {
    name: 'btnSize',
    label: '按钮尺寸',
    type: 'string',
    control: 'select',
    width: '50%',
    optionList: [{
      label: '大',
      value: '.btn-lg'
    }, {
      label: '正常',
      value: ''
    }, {
      label: '小',
      value: 'btn-sm'
    }],
    value: ''
  }, {
    name: 'size',
    label: '字体大小',
    type: 'number',
    width: '50%',
    value: 14
  }, {
    name: 'icon',
    label: '图标',
    type: 'string',
    width: '50%',
    value: ''
  }, {
    name: 'disabled',
    label: '禁用',
    width: '50%',
    type: 'boolean',
    value: false
  }, {
    name: 'classNames',
    label: '样式',
    type: 'style'
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
