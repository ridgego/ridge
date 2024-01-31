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

export const eachNode = async (files, callback) => {
  for (const file of files) {
    await callback(file)
    if (file.children) {
      await eachNode(file.children, callback)
    }
  }
}

/* 从树节点过滤掉 */
export const filterTree = (treeData, filterCb) => {
  const result = []

  treeData.forEach(node => {
    if (filterCb(node)) {
      result.push(node)
    }
    if (node.children) {
      result.push(...filterTree(node.children, filterCb))
    }
  })
  return result
}

export const mapTree = (treeData, map) => {
  const result = []

  treeData.forEach(node => {
    const mapped = map(node)
    if (mapped) {
      if (node.children) {
        mapped.children = mapTree(node.children, map)
        if (mapped.children.length) {
          result.push(mapped)
        }
      } else {
        result.push(mapped)
      }
    }
  })
  return result
}

const buildFileTree = (file, dir, files, each) => {
  const treeNode = {
    id: file.id,
    key: file.id,
    label: file.name,
    type: file.type,
    path: (file.parent === -1) ? ('/' + file.name) : (dir.path + '/' + file.name),
    parent: file.parent,
    parentNode: dir,
    raw: file,
    value: file.id
  }
  if (file.mimeType) {
    treeNode.mimeType = file.mimeType
  }

  if (treeNode.type === 'directory') {
    const children = files.filter(item => item.parent === file.id)

    treeNode.children = children.map(child => buildFileTree(child, treeNode, files, each)).sort(sortFile)
  }
  each && each(treeNode)
  return treeNode
}
