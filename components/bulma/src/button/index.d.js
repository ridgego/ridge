import Button from './Button'
import Icon from './tv.svg'
export default {
  name: 'button',
  title: '按钮',
  component: Button,
  icon: Icon,
  type: 'vanilla',
  adjustSize: 'all',
  props: [{
    name: 'text',
    label: '文本',
    type: 'string',
    value: '按钮'
  }, {
    name: 'color',
    label: '颜色',
    type: 'string',
    control: 'select',
    bindable: false,
    value: 'is-white',
    optionList: [{
      label: '白色',
      value: 'is-white'
    },
    {
      label: '暗色',
      value: 'is-dark'
    },
    {
      label: '黑色',
      value: 'is-black'
    },
    {
      label: '文本',
      value: 'is-text'
    },
    {
      label: '主色',
      value: 'is-primary'
    },
    {
      label: '链接色',
      value: 'is-link'
    },
    {
      label: '信息色',
      value: 'is-info'
    },
    {
      label: '成功色',
      value: 'is-success'
    },
    {
      label: '警告色',
      value: 'is-warning'
    },
    {
      label: '危险色',
      value: 'is-danger'
    }]
  }, {
    name: 'size',
    label: '大小',
    type: 'string',
    control: 'select',
    bindable: false,
    value: '',
    optionList: [{
      label: '小号',
      value: 'is-small'
    },
    {
      label: '默认',
      value: ''
    },
    {
      label: '普通',
      value: 'is-normal'
    },
    {
      label: '中号',
      value: 'is-medium'
    },
    {
      label: '大号',
      value: 'is-large'
    }]
  }],
  events: [{
    label: '点击事件',
    name: 'onClick'
  }],
  width: 80,
  height: 40
}
