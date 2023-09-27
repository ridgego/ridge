import React from 'react'
import { Tabs, TabPane, Spin, List, Typography } from '@douyinfe/semi-ui'
import { ThemeContext } from '../movable/MoveablePanel.jsx'
import { ridge, appService, on } from '../../service/RidgeEditService.js'
import { EVENT_FILE_TREE_CHANGE } from '../../constant.js'
const trace = require('debug')('ridge:cl')
const { Text } = Typography
class ComponentListing extends React.Component {
  constructor () {
    super()
    this.el = document.createElement('div')
    this.ref = React.createRef()
    this.state = {
      loadedPackages: [],
      loadedComponents: [],
      currentPackage: '',
      fullLoading: true
    }

    this.loadedComponents = []
  }

  static contextType = ThemeContext

  async ensurePackageComponents (pkg) {
    for (const componentName of pkg.components) {
      const componentPath = pkg.name + '/' + componentName
      if (this.loadedComponents.filter(component => component.componentPath === componentPath).length === 0) {
        ridge.loader.loadComponent(componentPath).then(componentLoaded => {
          componentLoaded.packageName = pkg.name
          componentLoaded.componentName = componentName
          componentLoaded.componentPath = componentPath
          this.loadedComponents.push(componentLoaded)
          this.setState({
            loadedComponents: [...this.loadedComponents]
          })
        })
      }
    }
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
    const packageObject = await appService.getPackageJSONObject()
    if (packageObject == null) {
      return
    }

    const packageNames = Object.keys(packageObject.dependencies)
    const packagesLoading = []
    // Load Package
    for (const pkname of packageNames) {
      packagesLoading.push(await ridge.loader.getPackageJSON(pkname))
    }
    await Promise.allSettled(packagesLoading)
    const loadedPackages = packagesLoading.filter(n => n != null).map(pkg => {
      pkg.componentLoaded = false
      if (pkg.icon) {
        pkg.icon = ridge.loader.baseUrl + '/' + pkg.name + '/' + pkg.icon
      }
      return pkg
    })

    if (loadedPackages.length) {
      this.setState({
        fullLoading: false,
        loadedPackages,
        currentPackage: loadedPackages[0].name
      })
    } else {
      this.setState({
        fullLoading: false
      })
    }

    this.ensurePackageComponents(loadedPackages[0])
  }

  componentDidMount () {
    this.loadPackages()
    on(EVENT_FILE_TREE_CHANGE, () => {
      this.loadPackages()
    })
  }

  dragStart (ev, info) {
    window.dragComponent = info

    ev.dataTransfer.setData('text/plain', JSON.stringify(info))

    const img = new window.Image()
    img.src = info.icon
    img.style.width = '50px'
    img.style.height = '50px'

    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 50

    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, 50, 50)

    trace('drag start', info, img)

    ev.dataTransfer.setDragImage(canvas, 25, 25)
  }

  getFilteredComponents (pkgName) {
    const { loadedComponents } = this.state

    if (this.context) {
      return loadedComponents.filter(component => (component.title || component.label).indexOf(this.context) > -1)
    } else {
      return loadedComponents.filter(component => component.packageName === pkgName)
    }
  }

  renderComponentIcon (icon, label) {
    if (icon) {
      return (
        <div className='image-icon'>
          <img src={icon} />
          <Text>{label} </Text>
        </div>
      )
    } else {
      return <Text>{label} </Text>
    }
  }

  render () {
    const { fullLoading, loadedPackages, currentPackage, loadedComponents } = this.state
    const { dragStart, renderComponentIcon } = this

    const tabChange = this.tabChange.bind(this)
    return (
      <>
        {fullLoading && <Spin size='large' tip='等待应用载入' />}
        {!fullLoading &&
          <Tabs
            type='button'
            size='small'
            tabPosition='left'
            activeKey={currentPackage}
            onChange={key => tabChange(key)}
          >
            {loadedPackages.length && loadedPackages.map(pkg => {
              // let listComponents = pkg.components
              // if (pkg.loadedComponents) {
              //   listComponents = this.getFilteredComponents(pkg.loadedComponents).sort((a, b) => (a.order || 10) - (b.order || 10)).map(component => component.name)
              // }
              let TabContent = <div className={'package-icon ' + pkg.icon} />
              if (pkg.icon) {
                TabContent = <div className='package-icon'><img src={pkg.icon} /></div>
              } else {
                TabContent = <div className='package-icon'>{pkg.name.charAt(0)}</div>
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
                  <List
                    grid={{
                      gutter: 6,
                      span: 8
                    }}
                    dataSource={pkg.components}
                    renderItem={item => {
                      const loadedComponent = loadedComponents.filter(component => component.packageName === pkg.name && component.componentName === item)[0]
                      if (loadedComponent) {
                        return (
                          <List.Item>
                            <div
                              draggable
                              onDragStart={ev => dragStart(ev, Object.assign(loadedComponent, {
                                componentPath: pkg.name + '/' + loadedComponent.path
                              }))}
                              className='component-container'
                            >
                              {renderComponentIcon(loadedComponent.icon, loadedComponent.title)}
                            </div>
                          </List.Item>
                        )
                      } else {
                        return (
                          <List.Item>
                            <div
                              className='component-container loading'
                            />
                          </List.Item>
                        )
                      }
                    }}
                  />
                </TabPane>
              )
            })}
          </Tabs>}
      </>
    )
  }
}

export default ComponentListing
