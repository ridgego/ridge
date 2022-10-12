import React from 'react'
import { Button, Space, Dropdown, Divider } from '@douyinfe/semi-ui'
import { IconPlusStroked, IconMinusStroked, IconCandlestickChartStroked, IconCustomize } from '@douyinfe/semi-icons'

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
    const { zoom, zoomChange, itemClick } = this.props
    const zoomMenu = (
      <Dropdown.Menu>
        <Dropdown.Item
          key='100'
          onClick={() => zoomChange()}
        >
          适应窗口
        </Dropdown.Item>
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
          <Dropdown.Item
            key={info.key}
            onClick={() => zoomChange(info.key)}
          >
            {info.value}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    )
    return (
      <div className='ridge-toolbar'>
        <div className='left'>
          <Button
            title='添加组件'
            type='tertiary'
            onClick={() => itemClick('insert-panel')}
            icon={<IconCustomize />}
          />

        </div>
        <Space spacing={3}>
          <Button
            title='减小画布'
            type='tertiary'
            onClick={() => zoomChange(zoom - 0.05)}
            icon={<IconMinusStroked />}
          />

          <Dropdown
            render={zoomMenu}
            placement='bottomLeft'
          >
            <Button
              type='tertiary'
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
            type='tertiary'
            icon={<IconPlusStroked />}
            onClick={() => zoomChange(zoom + 0.05)}
          />
        </Space>
        <Button
          title='属性面板'
          type='tertiary'
          icon={<IconCandlestickChartStroked />}
          onClick={() => itemClick('props-panel')}
        />
      </div>
    )
  }
}
