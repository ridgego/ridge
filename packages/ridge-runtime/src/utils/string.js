import { customAlphabet } from 'nanoid'
import camelCase from 'lodash/camelCase'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)

export {
  camelCase,
  nanoid
}
