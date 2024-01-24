export default {
  name: 'BootStrapStyle',
  icon: 'icons/icon.svg',
  title: '公用样式',
  type: 'style',
  classTreeData: {
    label: 'BootStrap',
    key: 'bootstrap',
    children: [{
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
    }, {
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
    }, {
      label: '边框阴影',
      key: 'bootstrap-shadow',
      children: [{
        label: '无',
        key: 'shadow-none'
      }, {
        label: '细微',
        key: 'shadow-sm'
      }, {
        label: '普通',
        key: 'shadow'
      }, {
        label: '显著',
        key: 'shadow-lg'
      }]
    }, {
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
      }, {
        label: '无下滑线',
        key: 'text-decoration-none'
      }]
    }, {
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
    }]
  },
  width: 100,
  height: 36
}
