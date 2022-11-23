
/**
* 支持整个工作区拖拽、放入及整体Zoom
*/
class EdtiorViewPort {
  constructor({
    workSpaceEl,
    selectorViewPort,
    zoomable,
    zoom
  }) {
    this.workSpaceEl = workSpaceEl
    this.selectorViewPort = selectorViewPort
    this.zoom = 1
  }

  layout ({
    width,
    height
  }) {

  }


  init () {
    const { workspaceWrapper } = this
    let isViewPortMoving = false

    workspaceWrapper.current?.addEventListener('mousedown', (e) => {
      if (e.ctrlKey) {
        isViewPortMoving = true
      }
    })

    workspaceWrapper.current?.addEventListener('mousemove', event => {
      if (isViewPortMoving && event.ctrlKey && this.state.selectedTargets.length === 0) {
        this.setState({
          viewX: this.state.viewX + event.movementX,
          viewY: this.state.viewY + event.movementY
        })
      }
    })

    workspaceWrapper.current?.addEventListener('mouseup', (e) => {
      isViewPortMoving = false
    })
  }
}

export default EdtiorViewPort
