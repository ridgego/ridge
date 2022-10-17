import Rect from './Rect'

export default {
  name: 'rect',
  component: Rect,
  props: [{
    name: 'style',
    label: '样式',
    type: 'css-style',
    value: {
      borderColor: '#ddd',
      borderWidth: '1px',
      borderStyle: 'solid'
    }
  }]
}
