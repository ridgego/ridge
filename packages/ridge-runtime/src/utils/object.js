import _isObject from 'lodash/isObject'
import _isNumber from 'lodash/isNumber'
import _values from 'lodash/values'
import _unset from 'lodash/unset'
import _toPath from 'lodash/toPath'
import _has from 'lodash/has'
import _set from 'lodash/set'
import _get from 'lodash/get'

const pathToArrayElem = path => {
  const pathArray = _toPath(path) // internal-issues:673

  const justNumber = _isNumber(path) && pathArray.length === 1
  return justNumber ? false : Number.isInteger(+pathArray[pathArray.length - 1])
}

function isEmptyObject (target) {
  /**
   *  var a = {};
   *  var b = { c: undefined }
   *  var d = {
   *      e: function(){},
   *      f: Symbol(''),
   *  }
   *  the result of JSON.stringify(a/b/d) are same: '{}'
   *  We can use the above features to remove keys with empty values in Form
   *  But we cannot use JSON.stringify() directly, because if the input parameter of JSON.stringify includes fiberNode, it will cause an TypeError: 'Converting circular structure to JSON'
   *  So we have to mock it's behavior, also, the form value cannot have Symbol or function type, it can be ignored
   */
  if (!_isObject(target)) {
    return false
  } else {
    const valuesOfTarget = _values(target) // values(a)  ->   []
    // values(b)  ->   [undefined]

    if (!valuesOfTarget.length) {
      return true // like target: {}
    } else {
      return valuesOfTarget.every(item => typeof item === 'undefined')
    }
  }
}

function cleanup (obj, path) {
  const pull = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true

  if (path.length === 0) {
    return
  }

  const target = _get(obj, path) // remove undefined from array
  // if (Array.isArray(target) && pull) {
  //     // only remove undefined form array from right to left
  //     // Remove undefined from right to left
  //     let lastIndex = findLastIndex(target, item => !isUndefined(item));
  //     lodashRemove(target, (value, index, array) => index > lastIndex);
  // }
  // Delete object if its empty
  // eslint-disable-next-line

  if (Array.isArray(target) && target.every(e => e == null)) {
    _unset(obj, path)
  } else if (isEmptyObject(target)) {
    _unset(obj, path)
  } // Recur

  cleanup(obj, path.slice(0, path.length - 1), pull)
}

export function empty (object) {
  return _values(object).length === 0
}
export function get (object, path) {
  return _get(object, path)
}
export function remove (object, path) {
  _unset(object, path) // a.b => [a, b]
  // arr[11].a => [arr, 11, a]

  let pathArray = _toPath(path)

  pathArray = pathArray.slice(0, pathArray.length - 1)
  cleanup(object, pathArray, false)
}
export function set (object, path, value, allowEmpty) {
  if (allowEmpty) {
    return _set(object, path, value)
  }

  if (value !== undefined) {
    return _set(object, path, value)
  } else {
    // If the path is to an array leaf then we want to set to undefined
    // 将数组的叶子节点置为undefined时，例如 a.b[0]  a.b[1]  a.b[99]
    if (pathToArrayElem(path) && get(object, path) !== undefined) {
      _set(object, path, undefined)

      let pathArray = _toPath(path)

      pathArray = pathArray.slice(0, pathArray.length - 1)
      cleanup(object, pathArray, false)
    } else if (!pathToArrayElem(path) && get(object, path) !== undefined) {
      // Only delete the field if it needs to be deleted and its not a path to an array ( array leaf )
      // eg:

      /*
          When the non-array leaf node is set to undefined
          for example: a.b.c
      */
      remove(object, path)
    }
  }
}
export function has (object, path) {
  return _has(object, path)
}
/**
 * set static properties from `srcObj` to `obj`
 * @param {object|Function} obj
 * @param {object|Function} srcObj
 * @returns {object|Function}
 */

export function forwardStatics (obj, srcObj) {
  if (obj && (typeof obj === 'function' || typeof obj === 'object') && srcObj && (typeof srcObj === 'function' || typeof srcObj === 'object')) {
    Object.entries(srcObj).forEach(_ref => {
      const [key, value] = _ref
      obj[key] = value
    })
  }

  return obj
}
