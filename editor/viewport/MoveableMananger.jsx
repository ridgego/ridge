import React from 'react'
import Moveable from 'react-moveable'

export default class MoveableManager extends React.Component {
  constructor (props) {
    super(props)
    this.moveable = React.createRef()
    this.resizeStart = {
      x: 0,
      y: 0
    }
  }

  getMoveable () {
    return this.moveable.current
  }

  render () {
    const {
      selectedTargets,
      zoom,
      dragEnd,
      drag,
      resizeEnd
    } = this.props

    const { moveable } = this

    const selectedElement = selectedTargets.map(t => document.getElementById(t))

    const elementGuidelines = [document.querySelector('.viewport-container'), ...Array.from(document.querySelectorAll('.ridge-node')).filter(el => selectedElement.indexOf(el) === -1)]

    return (
      <Moveable
        ref={moveable}
        targets={selectedElement}
        dimensionViewable
        deleteButtonViewable={false}
        draggable
        /* Only one of resizable, scalable, warpable can be used. */
        resizable
        pinchable={['rotatable']}
        zoom={1 / zoom}
        throttleResize={1}
        throttleDragRotate={0}
        /* When resize or scale, keeps a ratio of the width, height. */
        keepRatio={selectedTargets.length > 1}
        rotatable={false}
        snappable
        snapGap={false}
        isDisplayInnerSnapDigit
        roundable
        elementGuidelines={elementGuidelines}
        clipArea
        clipVerticalGuidelines={[0, '50%', '100%']}
        clipHorizontalGuidelines={[0, '50%', '100%']}
        clipTargetBounds
        onDragStart={({ target, clientX, clientY }) => {
        }}
        onDrag={ev => {
          ev.target.style.transform = ev.transform
          drag && drag(ev.target, ev)
        }}
        onDragGroupStart={groupDrag => {

        }}
        onDragGroup={({
          events
        }) => {
          events.forEach(({
            target,
            transform
          }) => {
            target.style.transform = transform
          })
        }}
        onResizeGroup={({
          events
        }) => {
          events.forEach(({
            target,
            width,
            height,
            delta,
            transform
          }) => {
            target.style.transform = transform
            delta[0] && (target.style.width = `${width}px`)
            delta[1] && (target.style.height = `${height}px`)
          })
        }}
        onDragEnd={ev => {
          dragEnd && dragEnd(ev.target, ev)
        }}
        onResizeStart={({ target, clientX, clientY }) => {
        }}
        onResize={({
          target,
          width,
          height,
          delta,
          transform
        }) => {
          target.style.transform = transform
          delta[0] && (target.style.width = `${width}px`)
          delta[1] && (target.style.height = `${height}px`)
        }}
        onResizeEnd={({ target, isDrag, clientX, clientY }) => {
          resizeEnd && resizeEnd(target)
        }}
        /* scalable */
        /* Only one of resizable, scalable, warpable can be used. */
        scalable
        throttleScale={0}
        onScaleStart={({ target, clientX, clientY }) => {
          console.log('onScaleStart', target)
        }}
        onScale={({
          target, scale, dist, delta, transform,
          clientX, clientY
        }) => {
          console.log('onScale scale', scale)
        }}
        onScaleEnd={({ target, isDrag, clientX, clientY }) => {
          console.log('onScaleEnd', target, isDrag)
        }}
        throttleRotate={0}
        onRotateStart={({ target, clientX, clientY }) => {
          console.log('onRotateStart', target)
        }}
        onRotate={({
          target,
          delta, dist,
          transform,
          clientX, clientY
        }) => {
          console.log('onRotate', dist)
        }}
        onRotateEnd={({ target, isDrag, clientX, clientY }) => {
          console.log('onRotateEnd', target, isDrag)
        }}
            // Enabling pinchable lets you use events that
            // can be used in draggable, resizable, scalable, and rotateable.
        onPinchStart={({ target, clientX, clientY, datas }) => {
          // pinchStart event occur before dragStart, rotateStart, scaleStart, resizeStart
          console.log('onPinchStart')
        }}
        onPinch={({ target, clientX, clientY, datas }) => {
          // pinch event occur before drag, rotate, scale, resize
          console.log('onPinch')
        }}
        onPinchEnd={({ isDrag, target, clientX, clientY, datas }) => {
          // pinchEnd event occur before dragEnd, rotateEnd, scaleEnd, resizeEnd
          console.log('onPinchEnd')
        }}
      />
    )
  }

  renderViewportMoveable () {
    return <div />
  }

  componentDidMount () {
  }
}
