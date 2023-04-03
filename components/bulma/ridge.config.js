module.exports = {
  copy: '../../public/npm_packages/ridge-bulma',
  concat: ''
}

const nodes = new Set()
const traverse = (object) => {
  if (Array.isArray(object)) {
    for (const value of object) {
      traverse(value)
    }
  } else if (typeof object === 'object') {
    try {
      for (const value of Object.values(object)) {
        if (value instanceof Node) {
          nodes.add(value)
        } else {
          traverse(value)
        }
      }
    } catch (e) {}
  }
}
