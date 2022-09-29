import React from "react";
import Selecto, { Rect } from "react-selecto";
import Viewport from "./viewport/ViewPort.jsx";
import MoveableManager from "./viewport/MoveableMananger.jsx";

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTargets: [],
            viewX: 0,
            viewY: 0,
            zoom: 1
        }
    }
    render() {
        const {
            moveableManager,
            viewport,
            menu,
            selecto,
            state,
            contentRef,
            workspaceWrapper
        } = this;
        const {
            selectedTargets,
            zoom,
            viewX,
            viewY
        } = state;
        const {
            width,
            height,
        } = this.props;
        let unit = 50;

        if (zoom < 0.8) {
            unit = Math.floor(1 / zoom) * 50;
        }
        return (
            <div className="ridge-editor" >
                <div ref={contentRef} className="content" style={{
                        top: '42px',
                        bottom: 0,
                        position: 'absolute',
                        width: '100%'
                    }}>
                    <div className="workspace" ref={workspaceWrapper}
                        style={{
                            zoom: zoom
                        }}>
                        <Viewport ref={viewport}
                            onBlur={this.onBlur}
                            style={{
                                transform: `translate(${viewX}px, ${viewY}px)`,
                                width: `${width}px`,
                                height: `${height}px`,
                            }}>
                            <MoveableManager
                                ref={moveableManager}
                                selectedTargets={selectedTargets}
                                zoom={zoom}
                            ></MoveableManager>
                        </Viewport>
                    </div>
                </div>
                
                <Selecto
                    ref={selecto}
                    dragContainer={".workspace"}
                    hitRate={0}
                    selectableTargets={[`.viewport-container .ridge-node`]}
                    selectByClick={true}
                    selectFromInside={false}
                    toggleContinueSelect={["shift"]}
                    preventDefault={true}
                    onDragStart={e => {
                        const inputEvent = e.inputEvent;

                        if (inputEvent.ctrlKey) {
                            e.stop();
                        }
                        const target = inputEvent.target;

                        this.console.log('Selecto Drag Start', target);
                    }}
                    onScroll={({ direction }) => {
                        // infiniteViewer.current!.scrollBy(direction[0] * 10, direction[1] * 10);
                    }}
                    onSelectEnd={({ isDragStart, selected, inputEvent, rect }) => {
                        if (isDragStart) {
                            inputEvent.preventDefault();
                        }
                        if (this.selectEndMaker(rect)) {
                            return;
                        }
                        this.setSelectedTargets(selected).then(() => {
                            if (!isDragStart) {
                                return;
                            }
                        });
                    }}
                ></Selecto>
            </div>
        );
    }

    componentDidMount() {

    }
   
    fitToCenter() {
        const { width : contentWidth, height: contentHeight } = this.contentRef.current.getBoundingClientRect();
        const { width, height } =  this.props;

        if (contentWidth > width && contentHeight > height) {
            this.setState({
                viewX: ( contentWidth - width ) / 2,
                viewY: ( contentHeight - height ) / 2,
            })
        }
    }
}
