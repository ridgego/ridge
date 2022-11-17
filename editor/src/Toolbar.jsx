import React from 'react'
import { Button, Space, Dropdown, SplitButtonGroup } from '@douyinfe/semi-ui'
import { IconPlusStroked, IconMinusStroked, IconCandlestickChartStroked, IconCustomize, IconGlobeStroke, IconBrackets, IconBox, IconList } from '@douyinfe/semi-icons'

export default class Toolbar extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.state = {
      addComponentPanelShow: true,
      componentPropPanelShow: true,
      dataPanelShow: true
    }
  }

  render () {
    const { addComponentPanelShow, componentPropPanelShow, dataPanelShow } = this.state
    const { zoom, zoomChange, togglePanel } = this.props
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

    const toggleAddComponentPanel = () => {
      if (document.getElementById('componentAddPanel')) {
        document.getElementById('componentAddPanel').setShow(!addComponentPanelShow)
        this.setState({
          addComponentPanelShow: !addComponentPanelShow
        })
      }
    }
    const toggleComponentPropPanel = () => {
      if (document.getElementById('componentPropPanel')) {
        document.getElementById('componentPropPanel').setShow(!componentPropPanelShow)
        this.setState({
          componentPropPanelShow: !componentPropPanelShow
        })
      }
    }

    const toggleDataPanel = () => {
      if (document.getElementById('dataPanel')) {
        document.getElementById('dataPanel').setShow(!dataPanelShow)
        this.setState({
          dataPanelShow: !dataPanelShow
        })
      }
    }
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
              type={addComponentPanelShow ? 'primary' : 'tertiary'}
              theme={addComponentPanelShow ? 'light' : 'borderless'}
              onClick={() => toggleAddComponentPanel()}
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
        <Button
          title='数据面板'
          type={dataPanelShow ? 'primary' : 'tertiary'}
          theme={dataPanelShow ? 'light' : 'borderless'}
          icon={<IconBrackets />}
          onClick={() => toggleDataPanel()}
        />
        <Button
          title='属性面板'
          type={componentPropPanelShow ? 'primary' : 'tertiary'}
          theme={componentPropPanelShow ? 'light' : 'borderless'}
          icon={<IconCandlestickChartStroked />}
          onClick={() => toggleComponentPropPanel()}
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
