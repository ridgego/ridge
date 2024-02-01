import context from '../../service/RidgeEditorContext'

const getClassTreeData = (type) => {
  if (context.editorComposite) {
    const nodes = context.editorComposite.getNodes(node => node.componentDefinition?.type === type)
    const treeData = []
    for (const node of nodes) {
      treeData.push(node.componentDefinition.classTreeData)
    }
    return treeData
  } else {
    return []
  }
}

export {
  getClassTreeData
}
