import { Input } from 'antd'

export default ({
  value,
  input,
  placeholder,
  size,
  status,
  showCount,
  onChange,
  onPressEnter
}) => {
  return (
    <Input
      style={{
        width: '100%',
        height: '100%'
      }}
      placeholder={placeholder || ''}
      size={size}
      showCount={showCount}
      status={status}
      value={value}
      onChange={e => {
        input(e.target.value)
        onChange(e.target.value)
      }}
    />
  )
}
