const textColor = {
  label: '颜色',
  key: 'bootstrap-color',
  children: [{
    label: '主色',
    key: 'text-primary'
  }, {
    label: '主强调色',
    key: 'text-primary-emphasis'
  }, {
    label: '次要色',
    key: 'text-secondary'
  }, {
    label: '成功色',
    key: 'text-success'
  }, {
    label: '危险色',
    key: 'text-danger'
  }, {
    label: '警示色',
    key: 'text-warning'
  }, {
    label: '信息色',
    key: 'text-info'
  }, {
    label: '亮色',
    key: 'text-light'
  }, {
    label: '暗色',
    key: 'text-dark'
  }]
}

const backgroundColor = {
  label: '背景颜色',
  key: 'bootstrap-background-color',
  children: [{
    label: '主色',
    key: 'bg-primary'
  }, {
    label: '主强调色',
    key: 'text-primary-emphasis'
  }, {
    label: '次要色',
    key: 'bg-secondary'
  }, {
    label: '成功色',
    key: 'bg-success'
  }, {
    label: '危险色',
    key: 'bg-danger'
  }, {
    label: '警示色',
    key: 'bg-warning'
  }, {
    label: '信息色',
    key: 'bg-info'
  }, {
    label: '亮色',
    key: 'bg-light'
  }, {
    label: '暗色',
    key: 'bg-dark'
  }]
}

const border = {
  label: '边框',
  key: 'bootstrap-border',
  children: [{
    label: '无阴影',
    key: 'shadow-none'
  }, {
    label: '阴影',
    key: 'shadow-sm'
  }, {
    label: '普通阴影',
    key: 'shadow'
  }, {
    label: '显著阴影',
    key: 'shadow-lg'
  }, {
    label: '四边边框',
    key: 'border'
  }, {
    label: '上边框',
    key: 'border-top'
  }, {
    label: '下边框',
    key: 'border-bottom'
  }, {
    label: '左边框',
    key: 'border-start'
  }, {
    label: '右边框',
    key: 'border-end'
  }, {
    label: '边框宽度1',
    key: 'border-1'
  }, {
    label: '边框宽度2',
    key: 'border-2'
  }, {
    label: '边框宽度3',
    key: 'border-3'
  }, {
    label: '边框宽度4',
    key: 'border-4'
  }, {
    label: '边框主色',
    key: 'border-primary'
  }, {
    label: '边框危险色',
    key: 'border-danger'
  }, {
    label: '边框警示色',
    key: 'border-warning'
  }
  ]
}

const textStyle = {
  label: '文本风格',
  key: 'bootstrap-text-style',
  children: [{
    label: '加粗',
    key: 'fw-bold'
  }, {
    label: '次加粗',
    key: 'fw-semibold'
  }, {
    label: '普通',
    key: 'fw-medium'
  }, {
    label: '细',
    key: 'fw-light'
  }, {
    label: '紧凑行',
    key: 'lh-1'
  }, {
    label: '次紧凑行',
    key: 'lh-sm'
  }, {
    label: '普通',
    key: 'lh-base'
  }, {
    label: '宽行高',
    key: 'lh-lg'
  }, {
    label: '下划线',
    key: 'text-decoration-underline'
  }, {
    label: '横线',
    key: 'text-decoration-line-through'
  }]
}

const radius = {
  label: '圆角',
  key: 'bootstrap-border-radius',
  children: [{
    label: '圆角1',
    key: 'rounded-1'
  }, {
    label: '圆角2',
    key: 'rounded-2'
  }, {
    label: '圆角3',
    key: 'rounded-3'
  }, {
    label: '圆角4',
    key: 'rounded-4'
  }, {
    label: '圆角5',
    key: 'rounded-5'
  }]
}
export default {
  name: 'BootStrapStyle',
  icon: 'bi bi-palette',
  title: '公用样式',
  type: 'style',
  classTreeData: {
    label: 'BootStrap',
    key: 'bootstrap',
    children: [textColor, backgroundColor, border, textStyle, radius]
  },
  width: 100,
  height: 36
}
