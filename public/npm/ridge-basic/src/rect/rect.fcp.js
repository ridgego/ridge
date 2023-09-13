import Rect from './Rect'

export default {
  name: 'rect',
  component: Rect,
  props: [{
    name: 'style',
    type: 'css-style',
    value: {
      borderColor: '#ddd',
      borderWidth: '1',
      borderStyle: 'solid'
    }
  }]
}
