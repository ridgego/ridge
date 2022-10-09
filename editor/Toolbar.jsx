import React from 'react'
import { Button, Divider, Dropdown, Menu } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'
import 'antd/dist/antd.css'

export default class Toolbar extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.state = {
      selectedTargets: [],
      viewX: 0,
      viewY: 0
    }
  }

  render () {
    const { zoom, zoomChange } = this.props
    const zoomMenu = (
      <Menu>
        <Menu.Item
          key='100'
          onClick={() => zoomChange()}
        >
          适应窗口
        </Menu.Item>
        {[
          {
            key: 0.8,
            value: '80%'
          },
          {
            key: 1,
            value: '100%'
          },
          {
            key: 1.5,
            value: '150%'
          },
          {
            key: 2,
            value: '200%'
          }
        ].map(info => (
          <Menu.Item
            key={info.key}
            onClick={() => zoomChange(info.key)}
          >
            {info.value}
          </Menu.Item>
        ))}
      </Menu>
    )
    return (
      <div className='ridge-toolbar'>
        <Divider
          type='vertical'
        />
        <div class='left' />
        <div className='right'>
          <Button
            title='减小画布'
            type='text'
            onClick={() => zoomChange(zoom - 0.05)}
            icon={<MinusOutlined />}
          />

          <Dropdown
            overlay={zoomMenu}
            placement='bottomLeft'
          >
            <Button
              type='text'
              size='middle'
              style={{
                padding: 0,
                width: '50px'
              }}
            >
              {Math.round(zoom * 100) + '%'}
            </Button>
          </Dropdown>

          <Button
            title='增大画布'
            type='text'
            icon={<PlusOutlined />}
            onClick={() => zoomChange(zoom + 0.05)}
          />

        </div>
      </div>
    )
  }
}
