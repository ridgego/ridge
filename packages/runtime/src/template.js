// import _ from 'lodash'
import debug from 'debug'
import lodashTemplate from 'lodash/template'
import lodashAt from 'lodash/at'
const log = debug('rg:template')
const compiledTemplates = new Map()

export default function template (tplString, variables, utils) {
  if (log.enabled) {
    log('模板计算', tplString, variables)
  }

  // 增加lodash对象到变量，使所有_的方法都能被表达式使用
  if (utils) {
    Object.assign(variables, utils)
  }
  // eslint-disable-next-line no-new-func
  if (typeof tplString === 'string') {
    if (tplString.startsWith('${')) {
      // 用 ${} 为模板计算 这类性能低容易出错
      try {
        // eslint-disable-next-line no-new-func
        const func = new Function(...Object.keys(variables), `return \`${tplString}\`;`)

        return func(...Object.values(variables))
      } catch (e) {
        return null
      }
    } else if (tplString.match(/{{([\s\S]+?)}}/g)) {
      // 用 {{ 为模板进行计算的情况 }}
      if (!compiledTemplates.get(tplString)) {
        compiledTemplates.set(tplString, lodashTemplate(tplString, {
          interpolate: /{{([\s\S]+?)}}/g
        }))
      }
      return compiledTemplates.get(tplString)(variables)
    } else {
      // javascript表达式情况。
      try {
        // 首先转换为模板字符串
        const tplStringCon = `{{JSON.stringify(${tplString})}}`
        // 用lodash计算为结果字符串
        const tplFunc = lodashTemplate(tplStringCon, {
          interpolate: /{{([\s\S]+?)}}/g
        })

        // 反向解码
        return JSON.parse(tplFunc(variables))
      } catch (err) {
        try {
          // 按路径获取
          return lodashAt(variables, tplString)[0]
        } catch (err1) {
          // 按JSON格式
          return JSON.parse(tplString)
        }
      }
    }
  } else {
    return tplString
  }
}

export function isTemplateStr (tplString) {
  return tplString.startsWith('${') || tplString.startsWith('{{')
}
