export default {
  style: (props) => {
    return {
      border: props.border,
      padding: props.padding,
      shadow: props.shadow
    }
  },
  props: [{
    name: 'border',
    label: '边框',
    type: 'string',
    control: 'border',
    value: '1px solid #ccc'
  }, {
    name: 'padding',
    label: '内边距',
    type: 'string',
    control: 'padding',
    value: '5px'
  }, {
    name: 'shadow',
    label: '阴影',
    type: 'string',
    control: 'border',
    value: 'none'
  }]
}
