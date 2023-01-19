export default {
  style: (props) => {
    const style = {
      background: props.background,
      padding: props.padding,
      borderRadius: props.radius,
      boxShadow: props.shadow
    }
    if (typeof props.border === 'object') {
      style.borderTop = props.border[0]
      style.borderRight = props.border[1]
      style.borderBottom = props.border[2]
      style.borderLeft = props.border[3]
    } else if (typeof props.border === 'string') {
      style.border = props.border
    }
    return style
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
    control: 'boxshadow',
    value: ''
  }]
}
