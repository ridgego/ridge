import { customAlphabet } from 'nanoid'
import camelCase from 'lodash/camelCase'
import trim from 'lodash/trim'
import dayjs from 'dayjs'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)

const formateDate = (mill, format) => {
  const m = mill || new Date().getTime()
  return dayjs(m).format(format || 'YYYY-MM-DD HH:mm:ss')
}

const dirname = (path) => {
  return path.substring(0, path.lastIndexOf('/'))
}

const basename = (path, ext) => {
  const fileName = path.substring(path.lastIndexOf('/') + 1)
  if (ext) {
    return fileName.substring(0, fileName.lastIndexOf(ext))
  } else {
    return fileName
  }
}
const extname = (path) => {
  return path.substring(path.lastIndexOf('.'))
}

export {
  basename,
  dirname,
  extname,
  camelCase,
  trim,
  formateDate,
  nanoid
}
