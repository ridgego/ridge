export default {
  style: (props) => {
    return {
      border: props.border,
      background: props.background,
      padding: props.padding,
      borderRadius: props.radius,
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
    name: 'radius',
    label: '圆角',
    type: 'string',
    control: 'px4'
  }, {
    name: 'padding',
    label: '内边',
    type: 'string',
    control: 'px4'
  }, {
    name: 'background',
    label: '背景',
    type: 'string',
    control: 'background'
  }, {
    name: 'shadow',
    label: '阴影',
    type: 'string',
    control: 'shadow',
    value: ''
  }]
}
