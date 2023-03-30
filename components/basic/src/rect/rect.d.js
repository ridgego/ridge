import Rect from './Rect'
import { border } from 'ridge-prop-utils'
import icon from './bounding-box-circles.svg'

export default {
  name: 'rect',
  component: Rect,
  icon,
  type: 'vanilla',
  title: '矩形',
  width: 120,
  height: 90,
  props: [...border.props]
}
