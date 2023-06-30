import RelativeContainer from './RelativeContainer.js'
export default {
  name: 'relative-container',
  component: RelativeContainer,
  label: '绝对容器',
  type: 'vanilla',
  order: 4,
  icon: 'bi bi-pip',
  props: [{
    name: 'children',
    hidden: true,
    type: 'children'
  }],
  childStyle: [{
    label: 'X',
    width: '50%',
    control: 'number',
    field: 'style.x',
    fieldEx: 'styleEx.x'
  }, {
    label: 'Y',
    width: '50%',
    control: 'number',
    field: 'style.y',
    fieldEx: 'styleEx.y'
  }, {
    label: 'W',
    width: '50%',
    control: 'number',
    field: 'style.width',
    fieldEx: 'styleEx.width'
  }, {
    label: 'H',
    width: '50%',
    control: 'number',
    field: 'style.height',
    fieldEx: 'styleEx.height'
  }, {
    field: 'style.relative',
    type: 'array',
    label: '定位',
    control: 'checkboxgroup',
    bindable: false,
    optionList: [{
      label: '靠左固定',
      icon: 'IconAlignHLeftStroked',
      value: 'left'
    }, {
      label: '靠上固定',
      icon: 'IconAlignVTopStroked',
      value: 'top'
    }, {
      label: '靠下固定',
      icon: 'IconAlignVBottomStroked',
      value: 'bottom'
    },
    {
      label: '靠右固定',
      icon: 'IconAlignHRightStroked',
      value: 'right'
    }, {
      label: '相对垂直中线固定',
      icon: 'IconAlignHCenterStroked',
      value: 'hcenter'
    },
    {
      label: '相对水平中线固定',
      icon: 'IconAlignVCenterStroked',
      value: 'vcenter'
    }]
  }],
  width: 540,
  height: 360
}
