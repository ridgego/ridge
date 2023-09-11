import AntdSelect from './AntdSelect.jsx'

export default {
  name: 'select',
  component: AntdSelect,
  props: [{
    label: '取值',
    name: 'value',
    type: 'string',
    value: ''
  }, {
    label: '选项',
    name: 'options',
    type: 'array',
    value: [{
      label: '选项1',
      value: 'value1'
    }, {
      label: '选项2',
      value: 'value2'
    }],
    control: 'json-editor'
  }],
  events: [{
    label: '输入值变化',
    name: 'onChange'
  }]
}
