import React from 'react'
import Selecto from 'react-selecto'
import Viewport from './viewport/ViewPort.jsx'
import MoveableManager from './viewport/MoveableMananger.jsx'
import Toolbar from './Toolbar.jsx'
import ComponentPropsPanel from './panels/ComponentPropsPanel.jsx'

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.contentRef = React.createRef()
    this.movableManager = React.createRef()
    this.nodePropPanelRef = React.createRef()
    this.state = {
      selectedTargets: [],
      currentNodeProps: {},
      viewX: 0,
      viewY: 0,
      zoom: 1.4
    }
  }

  render () {
    const {
      viewport,
      state,
      contentRef,
      nodePropPanelRef,
      workspaceWrapper,
      nodeStyleChange,
      movableManager,
      nodeCanvasChange,
      zoomChange
    } = this
    const {
      selectedTargets,
      currentNodeProps,
      zoom,
      viewX,
      viewY
    } = state
    const {
      pageConfig
    } = this.props

    return (
      <div className='ridge-editor'>
        <Toolbar zoom={zoom} zoomChange={zoomChange.bind(this)} />
        <div
          ref={contentRef} className='content' style={{
            top: '42px',
            bottom: 0,
            position: 'absolute',
            width: '100%'
          }}
        >
          <ComponentPropsPanel node={currentNodeProps} ref={nodePropPanelRef} inputStyleChange={nodeCanvasChange.bind(this)} />
          <div className='workspace' ref={workspaceWrapper}>
            <Viewport
              ref={viewport}
              {... pageConfig}
              style={{
                transform: `translate(${viewX}px, ${viewY}px) scale(${zoom})`,
                transformOrigin: 'center',
                width: `${pageConfig.properties.width}px`,
                height: `${pageConfig.properties.height}px`
              }}
            >
              <MoveableManager
                ref={movableManager}
                styleChange={nodeStyleChange.bind(this)}
                selectedTargets={selectedTargets}
                zoom={zoom}
              />
            </Viewport>
          </div>
        </div>

        <Selecto
          dragContainer='.workspace'
          hitRate={0}
          selectableTargets={['.viewport-container .ridge-node']}
          selectByClick
          selectFromInside={false}
          toggleContinueSelect={['shift']}
          preventDefault
          onDragStart={e => {
            const inputEvent = e.inputEvent
            const target = inputEvent.target
            // Group Selected for resize or move
            if (target.className.indexOf('moveable-area') > -1 || target.className.indexOf('moveable-control') > -1) {
              e.stop()
            }
            const closestRidgeNode = target.closest('.ridge-node')

            if (closestRidgeNode) {
              this.setState({
                selectedTargets: [closestRidgeNode].map(el => el.getAttribute('id'))
              }, () => {
                movableManager.current.getMoveable().dragStart(inputEvent)
              })
              this.setSelectedTargets([closestRidgeNode])
              e.stop()
            }
            if (inputEvent.ctrlKey) {
              movableManager.current.getMoveable().dragStart(inputEvent)
              e.stop()
            }
            // const target = inputEvent.target
          }}
          onScroll={({ direction }) => {
          }}
          onSelectEnd={({ isDragStart, selected, inputEvent, rect }) => {
            if (isDragStart) {
              inputEvent.preventDefault()
            }
            this.setSelectedTargets(selected)
          }}
        />
      </div>
    )
  }

  nodeStyleChange (el) {
    this.nodePropPanelRef.current?.styleChange(el)
  }

  /**
   * Update To Canvas Style
   */
  nodeCanvasChange (values, field) {
    const { selectedTargets } = this.state
    document.getElementById(selectedTargets[0]).style.width = values.width + 'px'
    document.getElementById(selectedTargets[0]).style.height = values.height + 'px'
    document.getElementById(selectedTargets[0]).style.transform = `translate(${values.x}px, ${values.y}px)`
    const moveable = this.movableManager.current?.getMoveable()
    moveable.updateTarget()
  }

  nodePropChange (node) {
    this.nodePropPanelRef.current?.nodeChange(node)
  }

  setSelectedTargets (selected) {
    this.setState({
      selectedTargets: selected.map(el => el.getAttribute('id'))
    }, () => {
      if (selected.length === 1) {
        this.nodeStyleChange(selected[0])
        this.nodePropChange()
      }
    })
  }

  zoomChange (zoom) {
    if (zoom) {
      this.setState({
        zoom
      })
    } else {
      this.fitToCenter()
    }
  }

  componentDidMount () {
    this.fitToCenter()
  }

  fitToCenter () {
    const refRect = this.contentRef.current.getBoundingClientRect()
    const contentWidth = refRect.width
    const contentHeight = refRect.height
    const { width, height } = this.props.pageConfig.properties

    if (contentWidth > width && contentHeight > height) {
      this.setState({
        viewX: (contentWidth - width) / 2,
        viewY: (contentHeight - height) / 2
      })
    }
  }
}
