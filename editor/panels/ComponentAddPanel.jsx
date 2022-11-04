import React from 'react'
import { Tabs, TabPane, Spin, Button, List } from '@douyinfe/semi-ui'
import PackageManager from '../manager/PackageManager'

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

  renderPackageComponents () {
    const { fcViewManager } = window
    const currentPackageObject = this.state.packages.filter(p => p.name === this.state.currentPackage)[0]
    currentPackageObject.components.forEach(({
      path
    }) => {
      // const targetEl = document.querySelector('[data-component-path="' + this.state.currentPackage + '/' + path + '"]')
      // if (targetEl.getAttribute('ridge-mounted')) {
      //   return
      // }
      // fcViewManager.createElementView({
      //   packageName: this.state.currentPackage,
      //   path
      // }, targetEl).then(() => {
      //   targetEl.setAttribute('ridge-mouted', '1')
      // })
    })
  }

  tabChange (key) {
    this.setState({
      currentPackage: key
    }, () => {
      this.renderPackageComponents()
    })
  }

  componentDidMount () {
    if (!this.state.packageListingLoaded) {
      this.packageManager = new PackageManager(this.props.context.loader)
      this.packageManager.getBuildInPackages().then(result => {
        this.setState({
          currentPackage: this.packageManager.packageNames[0],
          packages: result,
          packageListingLoaded: true
        }, () => {
          this.renderPackageComponents()
        })
      })
    }
  }

  dragStart (ev, {
    packageName,
    path,
    width,
    height
  }) {
    ev.dataTransfer.setData('text/plain', JSON.stringify({
      packageName,
      path,
      width,
      height
    }))
  }

  render () {
    const { packageListingLoaded, packages } = this.state
    const { dragStart } = this

    const tabChange = this.tabChange.bind(this)
    return (
      <div className='component-add-panel'>
        {!packageListingLoaded && <Spin size='large' />}
        <Tabs
          tabPosition='left'
          type='button'
          tabBarExtraContent={
            <Button
              onClick={() => {
                alert('you have clicked me!')
              }}
            >
              更多
            </Button>
            }
          onChange={key => tabChange(key)}
        >
          {packages && packages.map(pkg => {
            return (
              <TabPane
                style={{
                  padding: '4px'
                }}
                closable
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
                    <List.Item>
                      <div
                        draggable
                        onDragStart={ev => dragStart(ev, {
                          packageName: pkg.name,
                          width: item.width,
                          height: item.height,
                          path: item.path
                        })}
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
      </div>
    )
  }
}

export default AddMenu
