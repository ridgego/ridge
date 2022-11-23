import React from 'react'
import ReactDOM from 'react-dom'
import { Tabs, TabPane, Spin, Button, List } from '@douyinfe/semi-ui'
import MoveablePanel from './MoveablePanel.jsx'
import PackageManager from '../service/PackageManager'
import './component-add.less'

class ComponentAddPanel extends React.Component {
  constructor () {
    super()
    this.el = document.createElement('div')
    this.ref = React.createRef()
    this.packageManager = new PackageManager()
    this.state = {
      show: true,
      packages: [],
      currentPackage: 'ridge-basic',
      packageListingLoaded: false
    }
  }

  showPanel () {

  }

  renderPackageComponents () {
    const currentPackageObject = this.state.packages.filter(p => p.name === this.state.currentPackage)[0]
    currentPackageObject.components.forEach(({
      path
    }) => {
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
    document.getElementById('componentAddPanel').setShow = this.setShow.bind(this)
  }

  setShow (show) {
    this.setState({
      show
    })
  }

  getShow () {
    return this.show
  }

  dragStart (ev, info) {
    ev.dataTransfer.setData('text/plain', JSON.stringify(info))

    const img = new window.Image()
    img.src = info.icon
    ev.dataTransfer.setDragImage(img, 60, 60)
  }

  render () {
    const { packageListingLoaded, packages, show } = this.state
    const { dragStart } = this

    const tabChange = this.tabChange.bind(this)
    return (
      <MoveablePanel title='组件' left='45px' width='360px' height='760px' top='10px'>
        <div className={'component-add-panel ' + (show ? 'is-show' : '')} id='componentAddPanel'>
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
        </div>
      </MoveablePanel>

    )
  }
}

export default ComponentAddPanel
