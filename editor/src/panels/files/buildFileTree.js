export const getFileTree = (files, each) => {
  const roots = files.filter(file => file.parent === -1).map(file => buildFileTree(file, null, files, each)).sort(sortFile)
  return roots
}

const sortFile = (a, b) => {
  if (a.type === 'directory' && b.type === 'directory') {
    return a.label > b.label ? 1 : -1
  } else if (a.type === 'directory') {
    return -1
  } else if (b.type === 'directory') {
    return 1
  } else {
    return a.label > b.label ? 1 : -1
  }
}

export const eachNode = (files, callback) => {
  files.forEach((file) => {
    callback(file)
    if (file.children) {
      eachNode(file.children, callback)
    }
  })
}

const buildFileTree = (file, dir, files, each) => {
  const treeNode = {
    key: file.id,
    label: file.name,
    type: file.type,
    path: (file.parent === -1) ? (file.name) : (dir.path + '/' + file.name),
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

    treeNode.children = children.map(child => buildFileTree(child, treeNode, files, each)).sort(sortFile)
  }
  each && each(treeNode)
  return treeNode
}
