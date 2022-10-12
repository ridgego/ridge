import { Input } from 'antd'

export default (props) => {
  return (
    <Input
      style={{
        width: '100%',
        height: '100%'
      }}
      placeholder={props.placeholder || ''}
      value={props.value}
    />
  )
}
