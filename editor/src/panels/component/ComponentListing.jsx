import React from 'react'
import { Tabs, TabPane, Spin, List, Typography } from '@douyinfe/semi-ui'
import * as SemiIcon from '@douyinfe/semi-icons'
import { ThemeContext } from '../movable/MoveablePanel.jsx'
import { ridge, appService, on } from '../../service/RidgeEditService.js'
import { EVENT_FILE_TREE_CHANGE } from '../../constant.js'
const trace = require('debug')('ridge:component-panel')
const { Text } = Typography
class ComponentListing extends React.Component {
  constructor () {
    super()
    this.el = document.createElement('div')
    this.ref = React.createRef()
    this.state = {
      packages: [],
      currentPackage: '',
      fullLoading: true
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

  async loadPackages () {
    this.setState({
      fullLoading: true
    })
    const packageObject = appService.getPackageJSONObject()
    if (packageObject == null) {
      return
    }

    const packagesLoading = []

    // Load Package
    for (const pkname of this.packageNames) {
      packagesLoading.push(await ridge.loader.getPackageJSON(pkname))
    }

    await Promise.allSettled(packagesLoading)
    this.packagesDetails = packagesLoading.filter(n => n != null)

    return this.packagesDetails
  }

  componentDidMount () {
    this.loadPackages()
    on(EVENT_FILE_TREE_CHANGE, () => {
      this.loadPackages()
    })

    if (this.state.fullLoading) {
      trace('Request package listing')
      const packageObject = appService.getFileByPath('/package.json')
      if (packageObject == null) {

      }
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
    window.dragComponent = info
    ev.dataTransfer.setData('text/plain', JSON.stringify(info))

    const img = new window.Image()
    img.src = info.icon
    ev.dataTransfer.setDragImage(img, 60, 60)
  }

  getFilteredComponents (components) {
    if (!components) {
      return []
    }
    if (this.context) {
      return components.filter(component => (component.title || component.label).indexOf(this.context) > -1)
    } else {
      return components.filter(component => component != null)
    }
  }

  renderComponentIcon (icon) {
    if (icon) {
      if (icon.startsWith('data:image') || icon.startsWith('/') || icon.startsWith('http')) {
        return (
          <div className='image-icon'>
            <img src={icon} />
          </div>
        )
      } else if (icon.indexOf(' ') > -1) {
        return <div className={icon + ' font-icon'} />
      } else if (SemiIcon[icon]) {
        const Icon = SemiIcon[icon]
        return (
          <Icon
            style={{
              color: 'var( --semi-color-secondary)'
            }}
          />
        )
      }
    } else {
      return <Text>{item.title || item.label} </Text>
    }
  }

  render () {
    const { packageListingLoaded, packages, currentPackage } = this.state
    const { dragStart, renderComponentIcon } = this

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
            const filteredComponents = this.getFilteredComponents(pkg.componentLoaded).sort((a, b) => (a.order || 10) - (b.order || 10))
            let TabContent = <div className={'package-icon ' + pkg.icon} />
            if (pkg.icon) {
              // if (pkg.icon.startsWith('data:image')) {
              TabContent = <div className='package-icon'><img src={pkg.icon} /></div>
              // }
            }
            return (
              <TabPane
                style={{
                  padding: '4px'
                }}
                className='tab-title'
                collapsible
                tab={TabContent}
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
                      return (
                        <List.Item>
                          <div
                            draggable
                            onDragStart={ev => dragStart(ev, Object.assign(item, {
                              componentPath: pkg.name + '/' + item.path
                            }))}
                            className='component-container'
                          >
                            {renderComponentIcon(item.icon)}
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

export default ComponentListing
