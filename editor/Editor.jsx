import React from "react";
import Selecto, { Rect } from "react-selecto";
import Viewport from "./viewport/ViewPort.jsx";
import MoveableManager from "./viewport/MoveableMananger.jsx";

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.contentRef = React.createRef()
        this.state = {
            selectedTargets: [],
            viewX: 0,
            viewY: 0,
            zoom: 1
        }
    }
    render() {
        const {
            viewport,
            menu,
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
            pageConfig
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
                            { ... pageConfig }
                            onBlur={this.onBlur}
                            style={{
                                transform: `translate(${viewX}px, ${viewY}px)`,
                                width: `${pageConfig.properties.width}px`,
                                height: `${pageConfig.properties.height}px`,
                            }}>
                            <MoveableManager
                                rectChange={this.rectChange.bind(this)}
                                selectedTargets={selectedTargets}
                                zoom={zoom}
                            ></MoveableManager>
                        </Viewport>
                    </div>
                </div>
                
                <Selecto
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
                    }}
                    onScroll={({ direction }) => {
                        // infiniteViewer.current!.scrollBy(direction[0] * 10, direction[1] * 10);
                    }}
                    onSelectEnd={({ isDragStart, selected, inputEvent, rect }) => {
                        if (isDragStart) {
                            inputEvent.preventDefault();
                        }
                        this.setSelectedTargets(selected);
                    }}
                ></Selecto>
            </div>
        );
    }

    rectChange(target, opts) {
        const { styleChange, pageConfig } = this.props;
        const nodeId = target.getAttribute('ridge-componet-id');

        const targetNode = pageConfig.nodes.filter(n => n.id === nodeId)[0];


        let newTop = parseInt(targetNode.style.top);
        let newLeft = parseInt(targetNode.style.left);

        if (opts.delta) {
            newTop += opts.delta[1];
            newLeft += opts.delta[0];
        }
        if (targetNode) {
            styleChange({
                targetNode,
                style: {
                    top: newTop + 'px',
                    left: newLeft + 'px'
                }
            })
        }

        console.log(target, opts);
    }

    setSelectedTargets(selected) {
        this.setState({
            selectedTargets: selected.map(el => el.getAttribute('id'))
        })
    }

    componentDidMount() {
        this.fitToCenter()
    }
   
    fitToCenter() {
        const refRect = this.contentRef.current.getBoundingClientRect();
        const contentWidth = refRect.width;
        const contentHeight = refRect.height;
        const { width, height } =  this.props;

        if (contentWidth > width && contentHeight > height) {
            this.setState({
                viewX: ( contentWidth - width ) / 2,
                viewY: ( contentHeight - height ) / 2,
            })
        }
    }
}
