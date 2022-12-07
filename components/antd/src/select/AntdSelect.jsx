import { Select } from 'antd'

export default ({
  value,
  options,
  onChange,
  input
}) => {
  return (
    <Select
      style={{
        width: '100%',
        height: '100%'
      }}
      value={value}
      options={options}
      onChange={(val) => {
        input(val)
        onChange(val)
      }}
    />
  )
}
