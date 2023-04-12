import ColumnContainer from './ColumnContainer.js'
import { border } from 'ridge-prop-utils'
export default {
  name: 'column-container',
  component: ColumnContainer,
  label: '多行容器',
  type: 'vanilla',
  icon: 'IconSectionStroked',
  props: [{
    name: 'coverContainer',
    label: '填充',
    type: 'boolean'
  }, {
    name: 'children',
    hidden: true,
    type: 'children'
  }, ...border.props],
  childStyle: [{
    name: 'maxWidth',
    type: 'number',
    label: '最大宽度'
  }, {
    name: 'display',
    type: 'string',
    label: '显示',
    control: 'select',
    optionList: [{
      value: 'block',
      label: '整行'
    }, {
      value: 'inline-block',
      label: '行内'
    }],
    value: 'block'
  }, {
    name: 'center',
    type: 'boolean',
    value: true,
    label: '居中'
  }]
}
