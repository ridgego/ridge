import React from 'react'
import { Tabs, TabPane, Spin, List, Typography } from '@douyinfe/semi-ui'
import { ThemeContext } from '../movable/MoveablePanel.jsx'
import PackageManager from '../../service/PackageManager'

const trace = require('debug')('ridge:component-panel')
const { Text } = Typography
class InstalledComponents extends React.Component {
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

  static contextType = ThemeContext

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
      trace('Request package listing')
      this.packageManager.getBuildInPackages().then(result => {
        trace('App Package Loaded')
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

  getFilteredComponents (components) {
    if (this.context) {
      return components.filter(component => component.title.indexOf(this.context) > -1)
    } else {
      return components
    }
  }

  render () {
    const { packageListingLoaded, packages } = this.state
    const { dragStart } = this

    const tabChange = this.tabChange.bind(this)
    return (
      <>
        {!packageListingLoaded && <Spin size='large' />}
        <Tabs
          type='line'
          size='small'
          tabPosition='left'
          onChange={key => tabChange(key)}
        >
          {packages && packages.map(pkg => {
            const filteredComponents = this.getFilteredComponents(pkg.components)
            if (filteredComponents.length === 0) {
              return null
            }
            return (
              <TabPane
                style={{
                  padding: '4px'
                }}
                className='tab-title'
                collapsible
                tab={
                  <div
                    className='package-icon' style={{
                      '-webkit-mask-image': `url("${decodeURI(pkg.icon)}")`,
                      'mask-image': `url("${decodeURI(pkg.icon)}")`
                    }}
                  />
                }
                key={pkg.name}
                itemKey={pkg.name}
              >
                <List
                  grid={{
                    gutter: 6,
                    span: 8
                  }}
                  dataSource={filteredComponents}
                  renderItem={item => (
                    <List.Item>
                      <div
                        draggable
                        onDragStart={ev => dragStart(ev, Object.assign(item, {
                          componentPath: pkg.name + '/' + item.path
                        }))}
                        className='component-container'
                      >
                        <div
                          className='component-icon' style={{
                            '-webkit-mask-image': `url("${decodeURI(item.icon)}")`,
                            'mask-image': `url("${decodeURI(item.icon)}")`
                          }}
                        />
                        <Text>{item.title} </Text>
                      </div>
                    </List.Item>
                  )}
                />
              </TabPane>
            )
          })}
        </Tabs>
      </>
    )
  }
}

export default InstalledComponents
