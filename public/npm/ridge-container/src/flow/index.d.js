import FlowContainer from './FlowContainer.js'
import { border } from 'ridge-prop-utils'
export default {
  name: 'flow-container',
  component: FlowContainer,
  label: '流式容器',
  type: 'vanilla',
  icon: 'IconTemplateStroked',
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
