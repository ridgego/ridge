import React from 'react'
import { Tabs, TabPane, Spin, Button, List } from '@douyinfe/semi-ui'

class AddMenu extends React.Component {
  constructor () {
    super()
    this.ref = React.createRef()
    this.state = {
      packages: [],
      currentPackage: 'ridge-basic',
      packageListingLoaded: false
    }
  }

  showPanel () {

  }

  componentDidMount () {
    const { packageManager } = window
    if (!this.state.packageListingLoaded) {
      packageManager.getBuildInPackages().then(result => {
        this.setState({
          currentPackage: packageManager.packageNames[0],
          packages: result,
          packageListingLoaded: true
        })
      })
    }
  }

  async loadAndRenderPackage (packageName) {
  }

  render () {
    const { packageListingLoaded, packages } = this.state
    return (
      <div className='component-add-panel'>
        {!packageListingLoaded && <Spin size='large' />}
        <Tabs
          tabPosition='left' type='button' tabBarExtraContent={
            <Button
              onClick={() => {
                alert('you have clicked me!')
              }}
            >
              更多
            </Button>
        }
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
                    <img className='package-icon' src={pkg.icon} />
                    <span>{pkg.description}</span>
                  </div>
                }
                key={pkg.name}
                itemKey={pkg.name}
              >
                <List
                  grid={{
                    gutter: 12,
                    span: 12
                  }}
                  dataSource={pkg.components}
                  renderItem={item => (
                    <List.Item style={{}}>
                      <div
                        className='component-loading' style={{
                          height: '80px'
                        }}
                      >
                        <h3 style={{ color: 'var(--semi-color-text-0)', fontWeight: 500 }}>{item.path}</h3>
                      </div>
                    </List.Item>
                  )}
                />
              </TabPane>
            )
          })}

        </Tabs>
      </div>
    )
  }
}

export default AddMenu
