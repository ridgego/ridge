import React from 'react'
import { Tabs, TabPane, Spin, List } from '@douyinfe/semi-ui'
import MoveablePanel from './MoveablePanel.jsx'
import './component-add.less'

class AppPageListPanel extends React.Component {
  constructor () {
    super()
    this.ref = React.createRef()
    this.state = {
    }
  }

  render () {
    const { packageListingLoaded, packages } = this.state
    const { dragStart } = this

    const tabChange = this.tabChange.bind(this)
    return (
      <MoveablePanel title='应用页面管理' left='45px' width='320px' height='640px' top='10px' {...this.props}>
        {!packageListingLoaded && <Spin size='large' />}
        <Tabs
          type='card'
          size='small'
          onChange={key => tabChange(key)}
        >
          {packages && packages.map(pkg => {
            return (
              <TabPane
                style={{
                  padding: '4px'
                }}
                className='tab-title'
                tab={
                  <div className='package-tab'>
                    <span>{pkg.description}</span>
                  </div>
                }
                key={pkg.name}
                itemKey={pkg.name}
              >
                <List
                  grid={{
                    gutter: 6,
                    span: 8
                  }}
                  dataSource={pkg.components}
                  renderItem={item => (
                    <List.Item>
                      <div
                        draggable
                        onDragStart={ev => dragStart(ev, Object.assign(item, {
                          componentPath: pkg.name + '/' + item.path
                        }))}
                        className='component-container'
                      >
                        <img src={item.icon} />
                      </div>
                      <div>{item.title}</div>
                    </List.Item>
                  )}
                />
              </TabPane>
            )
          })}
        </Tabs>
      </MoveablePanel>
    )
  }
}

export default AppPageListPanel
