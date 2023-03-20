import Text from './Text.js'
import { text } from 'ridge-prop-utils'
export default {
  name: 'text',
  type: 'vanilla',
  component: Text,
  props: [{
    label: '内容',
    name: 'text',
    type: 'string',
    value: '文本'
  }, {
    label: '对齐',
    name: 'textAlign',
    type: 'string',
    value: 'left',
    control: 'radiogroup',
    bindable: false,
    optionList: [{
      label: '靠左',
      value: 'left'
    }, {
      label: '居中',
      value: 'center'
    }, {
      label: '靠右',
      value: 'right'
    }]
  }, ...text.props]
}
