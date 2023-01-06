import Text from './Text.jsx'

export default {
  name: 'Text',
  component: Text,
  props: [{
    label: '内容',
    name: 'text',
    type: 'string',
    value: '单行文本'
  }, {
    label: '大小',
    name: 'fontSize',
    type: 'number',
    value: 12
  }, {
    label: '类型',
    name: 'type',
    type: 'string',
    value: '',
    control: 'select',
    optionList: [{
      label: '成功',
      value: 'success'
    }, {
      label: '次要',
      value: 'secondary'
    }, {
      label: '警告',
      value: 'warning'
    }, {
      label: '危险',
      value: 'danger'
    }]
  }, {
    label: '样式',
    name: 'style',
    type: 'string',
    value: '',
    control: 'select',
    optionList: [{
      label: '选中',
      value: 'mark'
    }, {
      label: '代码',
      value: 'code'
    }, {
      label: '键盘',
      value: 'keyboard'
    }]
  }, {
    label: '禁用',
    name: 'disabled',
    type: 'boolean',
    value: false
  }, {
    label: '溢出省略',
    name: 'ellipsis',
    type: 'boolean',
    value: false
  }],
  events: [{
    label: '点击文本',
    name: 'onClick'
  }, {
    label: '按下回车键',
    name: 'onPressEnter'
  }]
}
