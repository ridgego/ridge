import { Button } from 'antd'

export default (props) => {
  return (
    <Button
      onClick={props.onClick}
      style={{
        width: '100%',
        height: '100%'
      }}
    >{props.text || 'Button'}
    </Button>
  )
}
