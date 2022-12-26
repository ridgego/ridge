import React from 'react'
import { Tabs, TabPane, Spin, List } from '@douyinfe/semi-ui'
import MoveablePanel from './MoveablePanel.jsx'
import PackageManager from '../service/PackageManager'
import '../css/component-add.less'

class ComponentAddPanel extends React.Component {
  constructor () {
    super()
    this.el = document.createElement('div')
    this.ref = React.createRef()
    this.packageManager = new PackageManager()
    this.state = {
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
  }

  dragStart (ev, info) {
    ev.dataTransfer.setData('text/plain', JSON.stringify(info))

    const img = new window.Image()
    img.src = info.icon
    ev.dataTransfer.setDragImage(img, 60, 60)
  }

  render () {
    const { position } = this.props
    const { packageListingLoaded, packages } = this.state
    const { dragStart } = this

    const tabChange = this.tabChange.bind(this)
    return (
      <MoveablePanel title='组件' position={position} {...this.props}>
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

export default ComponentAddPanel
