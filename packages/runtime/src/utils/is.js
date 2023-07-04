function isObject (objValue) {
  return objValue && typeof objValue === 'object' && objValue.constructor === Object
}

export {
  isObject
}
