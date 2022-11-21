
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
    super()
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
  
  layout () {

  }


  fitToCenter () {
    if (this.zoomable) {

      const workspaceEl = document.querySelector(this.selectorWorkSpace)
      const viewPortEl = document.querySelector(this.selectorViewPort)

      const refRect = workspace.getBoundingClientRect()
      const contentWidth = refRect.width
      const contentHeight = refRect.height

      const { width, height } = this.state.pageProps
      const fit = fitRectIntoBounds({ width, height }, { width: contentWidth, height: contentHeight })


      viewPortEl.style.transform = `translate(${viewX}px, ${viewY}px) scale(${zoom})`
      viewPortEl.style.transformOrigin: 'center',
      viewPortEl.style.width: `${pageProps.width}px`,
                height: `${pageProps.height}px`

    }


    this.setState({
      zoom: fit.width / width,
      viewX: (contentWidth - width) / 2,
      viewY: (contentHeight - height) / 2
    })
  }

}

export default EdtiorViewPort
