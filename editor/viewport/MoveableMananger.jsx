import React from "react";
import Moveable from "react-moveable";

export default class MoveableManager extends React.Component {
    constructor (props) {
        super(props);
        this.moveable = React.createRef();
    }
    
    render() {
        const {
            selectedTargets,
            zoom,
            rectChange,
        } = this.props;

        if (!selectedTargets.length) {
            return this.renderViewportMoveable();
        }
        const selectedElement = selectedTargets.map(t => document.getElementById(t));
        const elementGuidelines = [document.querySelector(".scena-viewport"), ...selectedElement];

        return <Moveable
            ref={this.moveable}
            targets={selectedElement}
            dimensionViewable={true}
            deleteButtonViewable={false}
            draggable={true}
            /* Only one of resizable, scalable, warpable can be used. */
            resizable={true}
            pinchable={["rotatable"]}
            zoom={1 / zoom}
            throttleResize={1}
            throttleDragRotate={0}
            /* When resize or scale, keeps a ratio of the width, height. */
            keepRatio={selectedTargets.length > 1 ? true : false}
            rotatable={false}
            snappable={true}
            snapGap={false}
            isDisplayInnerSnapDigit={true}
            roundable={true}
            elementGuidelines={elementGuidelines}
            clipArea={true}
            clipVerticalGuidelines={[0, "50%", "100%"]}
            clipHorizontalGuidelines={[0, "50%", "100%"]}
            clipTargetBounds={true}
            onDragStart={({ target, clientX, clientY }) => {
                console.log("onDragStart", target);
            }}
            onDrag={({
                target,
                beforeDelta, beforeDist,
                left, top,
                right, bottom,
                delta, dist,
                transform,
                clientX, clientY,
            }) => {
                console.log("onDrag left, top", left, top);
                // target!.style.left = `${left}px`;
                // target!.style.top = `${top}px`;
                console.log("onDrag Delta", delta);
                rectChange(target, {
                    delta
                })
                // target.style.transform = transform;
            }}
            onDragEnd={({ target, isDrag, clientX, clientY }) => {
                console.log("onDragEnd", target, isDrag);
            }}

            onResizeStart={({ target , clientX, clientY}) => {
                console.log("onResizeStart", target);
            }}
            onResize={({
                target, width, height,
                dist, delta, direction,
                clientX, clientY,
            }) => {
                console.log("onResize", target);
            }}
            onResizeEnd={({ target, isDrag, clientX, clientY }) => {
                console.log("onResizeEnd", target, isDrag);
            }}

            /* scalable */
            /* Only one of resizable, scalable, warpable can be used. */
            scalable={true}
            throttleScale={0}
            onScaleStart={({ target, clientX, clientY }) => {
                console.log("onScaleStart", target);
            }}
            onScale={({
                target, scale, dist, delta, transform,
                clientX, clientY,
            }) => {
                console.log("onScale scale", scale);
            }}
            onScaleEnd={({ target, isDrag, clientX, clientY }) => {
                console.log("onScaleEnd", target, isDrag);
            }}

            throttleRotate={0}
            onRotateStart={({ target, clientX, clientY }) => {
                console.log("onRotateStart", target);
            }}
            onRotate={({
                target,
                delta, dist,
                transform,
                clientX, clientY,
            }) => {
                console.log("onRotate", dist);
            }}
            onRotateEnd={({ target, isDrag, clientX, clientY }) => {
                console.log("onRotateEnd", target, isDrag);
            }}
            // Enabling pinchable lets you use events that
            // can be used in draggable, resizable, scalable, and rotateable.
            onPinchStart={({ target, clientX, clientY, datas }) => {
                // pinchStart event occur before dragStart, rotateStart, scaleStart, resizeStart
                console.log("onPinchStart");
            }}
            onPinch={({ target, clientX, clientY, datas }) => {
                // pinch event occur before drag, rotate, scale, resize
                console.log("onPinch");
            }}
            onPinchEnd={({ isDrag, target, clientX, clientY, datas }) => {
                // pinchEnd event occur before dragEnd, rotateEnd, scaleEnd, resizeEnd
                console.log("onPinchEnd");
            }}
        ></Moveable>
    }


    renderViewportMoveable() {
        return <div></div>
    }
    
    componentDidMount() {
    }
}