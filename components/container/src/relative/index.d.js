import RelativeContainer from './RelativeContainer.js'
import { border } from 'ridge-prop-utils'
export default {
  name: 'relative-container',
  component: RelativeContainer,
  label: '绝对容器',
  type: 'vanilla',
  icon: 'IconMarginStroked',
  props: [{
    name: 'coverContainer',
    label: '填充',
    type: 'boolean'
  }, {
    name: 'children',
    hidden: true,
    type: 'children'
  }, ...border.props.filter(prop => prop.name !== 'padding')],
  childStyle: [{
    name: 'relative',
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
  width: 180,
  height: 60
}
