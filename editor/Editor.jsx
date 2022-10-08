import React from 'react'
import Selecto from 'react-selecto'
import Viewport from './viewport/ViewPort.jsx'
import MoveableManager from './viewport/MoveableMananger.jsx'

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.contentRef = React.createRef()
    this.movableManager = React.createRef()
    this.state = {
      selectedTargets: [],
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
      workspaceWrapper,
      movableManager
    } = this
    const {
      selectedTargets,
      zoom,
      viewX,
      viewY
    } = state
    const {
      pageConfig
    } = this.props

    return (
      <div className='ridge-editor'>
        <div
          ref={contentRef} className='content' style={{
            top: '42px',
            bottom: 0,
            position: 'absolute',
            width: '100%'
          }}
        >
          <div
            className='workspace' ref={workspaceWrapper}
            style={{
            }}
          >
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
                rectChange={this.rectChange.bind(this)}
                guideLineNodes={pageConfig.nodes}
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
            console.log('drag start', target)
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
            // infiniteViewer.current!.scrollBy(direction[0] * 10, direction[1] * 10);
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

  rectChange (target, opts) {
    console.log('rect change', opts)
    const { styleChange, pageConfig } = this.props
    const nodeId = target.getAttribute('ridge-componet-id')

    const targetNode = pageConfig.nodes.filter(n => n.id === nodeId)[0]

    let newTop = parseInt(targetNode.style.top)
    let newLeft = parseInt(targetNode.style.left)
    // const newWidth = parseInt(targetNode.style.width)
    // const newHeight = parseInt(targetNode.style.height)

    if (opts.delta) {
      newTop += opts.delta.y || 0
      newLeft += opts.delta.x || 0
      // newWidth += opts.delta.width || 0
      // newHeight += opts.delta.height || 0
    }
    if (targetNode) {
      styleChange({
        targetNode,
        style: {
          // width: newWidth + 'px',
          // height: newHeight + 'px',
          top: newTop + 'px',
          left: newLeft + 'px'
        }
      })
    }
  }

  setSelectedTargets (selected) {
    this.setState({
      selectedTargets: selected.map(el => el.getAttribute('id'))
    }, () => {

    })
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
