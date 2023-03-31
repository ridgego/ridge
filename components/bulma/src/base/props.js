export const color = {
  name: 'color',
  label: '颜色',
  type: 'array',
  control: 'select',
  bindable: false,
  value: 'is-primary',
  width: '50%',
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
}

export const light = {
  name: 'light',
  label: '浅色',
  width: '50%',
  type: 'boolean'
}

export const isDelete = {
  name: 'isDelete',
  label: '删除',
  width: '50%',
  type: 'boolean'
}

export const size = {
  name: 'size',
  label: '大小',
  type: 'string',
  control: 'select',
  bindable: false,
  value: 'is-normal',
  width: '50%',
  optionList: [{
    label: '小号',
    value: 'is-small'
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
}
