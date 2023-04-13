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
    name: 'center',
    type: 'boolean',
    value: true,
    label: '居中'
  }, {
    name: 'fullwidth',
    type: 'boolean',
    value: true,
    label: '横向占满'
  }]
}
