export default {
  style: (props) => {
    const style = {
      border: props.border,
      background: props.background,
      padding: props.padding,
      borderRadius: props.radius,
      shadow: props.shadow
    }
    if (typeof props.border === 'object') {
      style.borderTop = props.border[0]
      style.borderRight = props.border[1]
      style.borderBottom = props.border[2]
      style.borderLeft = props.border[3]
    }
    return style
  },
  props: [{
    name: 'border',
    label: '边框',
    type: 'string',
    width: '50%',
    control: 'border',
    value: '1px solid #ccc'
  }, {
    name: 'radius',
    label: '圆角',
    wdith: '50%',
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
