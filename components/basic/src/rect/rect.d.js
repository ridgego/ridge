import Rect from './Rect'
import { border } from 'ridge-prop-utils'

export default {
  name: 'rect',
  component: Rect,
  type: 'vanilla',
  title: "矩形",
  width: 120,
  height: 90,
  props: [...border.props]
}
