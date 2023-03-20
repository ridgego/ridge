import Rect from './Rect'
import { border } from 'ridge-prop-utils'

export default {
  name: 'rect',
  component: Rect,
  type: 'vanilla',
  props: [...border.props]
}
