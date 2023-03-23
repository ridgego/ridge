export const getFileTree = (files, each) => {
  const roots = files.filter(file => file.parent === -1).map(file => buildFileTree(file, files, each)).sort((a, b) => {
    const lA = a.type === 'directory' ? '0' : '1'
    const lB = b.type === 'directory' ? '0' : '1'
    return lA > lB ? 1 : -1
  })
  return roots
}

const buildFileTree = (file, files, each) => {
  const treeNode = {
    key: file.id,
    label: file.name,
    type: file.type,
    parent: file.parent,
    raw: file,
    value: file.id
  }
  if (file.mimeType) {
    treeNode.mimeType = file.mimeType
    treeNode.dataUrl = file.dataUrl
  }

  if (treeNode.type === 'directory') {
    const children = files.filter(item => item.parent === file.id)

    treeNode.children = children.map(child => buildFileTree(child, files, each)).sort((a, b) => {
      return a.label > b.label ? 1 : -1
    })
  }
  each && each(treeNode)
  return treeNode
}
