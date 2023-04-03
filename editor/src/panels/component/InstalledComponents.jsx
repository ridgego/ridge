import React from 'react'
import { Tabs, TabPane, Spin, List, Typography } from '@douyinfe/semi-ui'
import * as SemiIcon from '@douyinfe/semi-icons'
import { ThemeContext } from '../movable/MoveablePanel.jsx'
import PackageManager from '../../service/PackageManager'
import { ridge } from '../../service/RidgeEditService.js'
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
    ridge.loader.loadPackageAndComponents(this.state.currentPackage).then(packageObject => {
      this.setState({
        packages: this.state.packages.map(p => {
          if (p.name === this.state.currentPackage) {
            return packageObject
          } else {
            return p
          }
        })
      })
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
    if (!components) {
      return null
    }
    if (this.context) {
      return components.filter(component => component.title.indexOf(this.context) > -1)
    } else {
      return components.filter(component => component != null)
    }
  }

  render () {
    const { packageListingLoaded, packages, currentPackage } = this.state
    const { dragStart } = this

    const tabChange = this.tabChange.bind(this)
    return (
      <>
        {!packageListingLoaded && <Spin size='large' />}
        <Tabs
          type='button'
          size='small'
          tabPosition='left'
          activeKey={currentPackage}
          onChange={key => tabChange(key)}
        >
          {packages && packages.map(pkg => {
            const filteredComponents = this.getFilteredComponents(pkg.componentLoaded)
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
                      // '-webkit-mask-image': `url("${decodeURI(pkg.icon)}")`,
                      // 'mask-image': `url("${decodeURI(pkg.icon)}")`
                    }}
                  >
                    <img src={decodeURI(pkg.icon)} />
                  </div>
                }
                key={pkg.name}
                itemKey={pkg.name}
              >
                {
                filteredComponents &&
                  <List
                    grid={{
                      gutter: 6,
                      span: 8
                    }}
                    dataSource={filteredComponents}
                    renderItem={item => {
                      const Icon = SemiIcon[item.icon]
                      return (
                        <List.Item>
                          <div
                            draggable
                            onDragStart={ev => dragStart(ev, Object.assign(item, {
                              componentPath: pkg.name + '/' + item.path
                            }))}
                            className='component-container'
                          >
                            {
                            item.icon && item.icon.startsWith('data:image') &&
                              <div
                                className='component-icon' style={{
                                  '-webkit-mask-image': `url("${decodeURI(item.icon)}")`,
                                  'mask-image': `url("${decodeURI(item.icon)}")`
                                }}
                              />
                            }
                            {Icon &&
                              <Icon
                                style={{
                                  color: item.iconColor || 'var( --semi-color-secondary)'
                                }}
                              />}
                            <Text>{item.title || item.label} </Text>
                          </div>
                        </List.Item>
                      )
                    }}
                  />
                  }
                {!filteredComponents && <Spin size='large' />}
              </TabPane>
            )
          })}
        </Tabs>
      </>
    )
  }
}

export default InstalledComponents
