import { customAlphabet } from 'nanoid'
import camelCase from 'lodash/camelCase'
import trim from 'lodash/trim'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)

const filename = fullPath => {
  const withExt = fullPath.substring(fullPath.lastIndexOf('/') + 1)
  // return withExt.includes('.') ? withExt.substring(0, withExt.lastIndexOf('.')) : withExt
  return withExt.split('.')[0]
}

export {
  filename,
  camelCase,
  trim,
  nanoid
}
