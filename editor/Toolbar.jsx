import React from "react";

export default class Toolbar extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef()
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
            <div className="ridge-editor">
              
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
}
