/**
 * 此文件据path-rewriter改写
 * Create rewrite function, to cache parsed rewrite rules.
 *
 * @param {Object} rewriteConfig
 * @return {Function} Function to rewrite paths; This function should accept `path` (request.url) as parameter
 */
const debug = require('debug')('wind:proxy')

module.exports = function createPathRewriter (rewriteConfig) {
  let rulesCache

  if (!isValidRewriteConfig(rewriteConfig)) {
    return
  }

  if (typeof rewriteConfig === 'function') {
    const customRewriteFn = rewriteConfig

    return customRewriteFn
  } else {
    rulesCache = parsePathRewriteRules(rewriteConfig)
    return rewritePath
  }

  function rewritePath (path) {
    let result = path

    for (const rule of rulesCache) {
      if (rule.regex.test(path)) {
        result = result.replace(rule.regex, rule.value)
        break
      }
    }

    return result
  }
}

const isObject = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function isValidRewriteConfig (rewriteConfig) {
  if (typeof rewriteConfig === 'function') {
    return true
  } else if (isObject(rewriteConfig)) {
    return Object.keys(rewriteConfig).length !== 0
  } else if (rewriteConfig === undefined || rewriteConfig === null) {
    return false
  } else {
    return false
  }
}

function parsePathRewriteRules (rewriteConfig) {
  const rules = []

  if (isObject(rewriteConfig)) {
    for (const [key] of Object.entries(rewriteConfig)) {
      rules.push({
        regex: new RegExp(key),
        value: rewriteConfig[key]
      })
      debug('[HPM] Proxy rewrite rule created: "%s" ~> "%s"', key, rewriteConfig[key])
    }
  }

  return rules
}
