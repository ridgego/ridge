import { Button } from 'antd'

export default (props) => {
  return (
    <Button style={{
      width: '100%',
      height: '100%'
    }}
    >{props.text || 'Button'}
    </Button>
  )
}
