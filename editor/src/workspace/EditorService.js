class EditorService {
  async openPage (id) {
    const file = await appService.getFile(id)
    if (file.type === 'page') {
      if (this.pageElementManager) {
        await this.saveCurrentPage()
        this.pageElementManager.unmount()
      }
      if (!workspaceControl.enabled) {
        workspaceControl.enable()
      }
      this.loadPage(file)
      workspaceControl.selectElements([])
    }
  }
}

export default EditorService
