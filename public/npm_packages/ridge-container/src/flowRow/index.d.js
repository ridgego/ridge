import RowContainer from './RowContainer'
import { border } from 'ridge-prop-utils'
export default {
  name: 'row-container',
  component: RowContainer,
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
    label: '居中',
    field: 'style.center',
    type: 'boolean',
    width: '50%',
    value: true
  }, {
    label: '横向占满',
    field: 'style.fullwidth',
    type: 'boolean',
    width: '50%',
    value: true
  }],
  width: 180,
  height: 60 
}
