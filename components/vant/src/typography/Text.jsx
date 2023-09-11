import { Typography } from 'antd'

export default ({
  text,
  type,
  disabled,
  ellipsis,
  style,
  strong,
  fontSize
}) => {
  const { Text } = Typography
  const styleObj = {}
  if (style) {
    styleObj[style] = true
  }
  return (
    <Text
      style={{
        width: '100%',
        height: '100%',
        fontSize: fontSize + 'px'
      }} type={type} disabled={disabled} ellipsis={ellipsis} strong={strong} {...styleObj}
    >
      {text}
    </Text>
  )
}
