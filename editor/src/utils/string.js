import { customAlphabet } from 'nanoid'
import camelCase from 'lodash/camelCase'
import trim from 'lodash/trim'
import dayjs from 'dayjs'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)

const formateDate = (mill, format) => {
  return dayjs(mill).format(format || 'YYYY-MM-DD HH:mm:ss')
}
export {
  camelCase,
  trim,
  formateDate,
  nanoid
}
