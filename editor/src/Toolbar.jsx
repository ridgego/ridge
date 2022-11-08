import React from 'react'
import { Button, Space, Dropdown, Divider, SplitButtonGroup } from '@douyinfe/semi-ui'
import { IconPlusStroked, IconMinusStroked, IconCandlestickChartStroked, IconCustomize, IconGlobeStroke, IconBrackets, IconBox, IconList } from '@douyinfe/semi-icons'

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
          <Space spacing={2}>
            <Button
              title='管理应用页面'
              type='tertiary'
              theme='borderless'
              onClick={() => itemClick('insert-panel')}
              icon={<IconBox />}
            />
            <Button
              title='添加组件'
              type='tertiary'
              theme='borderless'
              onClick={() => itemClick('insert-panel')}
              icon={<IconCustomize />}
            />
            <Button
              title='组件'
              type='tertiary'
              theme='borderless'
              onClick={() => itemClick('insert-panel')}
              icon={<IconList />}
            />
          </Space>

        </div>
        <Space spacing={2}>
          <Button
            title='减小画布'
            theme='borderless'
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
              theme='borderless'
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
            theme='borderless'
            type='tertiary'
            icon={<IconPlusStroked />}
            onClick={() => zoomChange(zoom + 0.05)}
          />
        </Space>
        <Button
          title='页面变量'
          theme='borderless'
          type='tertiary'
          icon={<IconBrackets />}
          onClick={() => itemClick('file-manager')}
        />
        <Button
          title='属性面板'
          theme='borderless'
          type='tertiary'
          icon={<IconCandlestickChartStroked />}
          onClick={() => itemClick('props-panel')}
        />
        <SplitButtonGroup aria-label='项目操作按钮组'>
          <Dropdown
            menu={[{
              node: 'item', name: '运行页面', onClick: () => console.log('编辑项目点击'), icon: <IconGlobeStroke />
            }, {
              node: 'item', name: '运行应用', onClick: () => console.log('编辑项目点击')
            }]} trigger='click' position='bottomRight'
          >
            <Button theme='borderless' icon={<IconGlobeStroke />}>运行/分发</Button>
          </Dropdown>
        </SplitButtonGroup>
      </div>
    )
  }
}
