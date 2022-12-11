import { customAlphabet } from 'nanoid'
import camelCase from 'lodash/camelCase'
import trim from 'lodash/trim'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)

export {
  camelCase,
  trim,
  nanoid
}
