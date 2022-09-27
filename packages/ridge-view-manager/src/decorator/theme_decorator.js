/*
 * @Author: guominghui
 * @Date: 2022-06-13 10:51:37
 * @Description:
 */
import ViewDecorator from './view_decorator.js'
import { parseValueForTranslateColorValues } from './parse_prop_default_value.js'
export default class ThemeDecorator extends ViewDecorator {
  initPropEvents (fcViewInstance) {
    this.checkColorValue(fcViewInstance)
  }

  /**
     * view实例mount后触发事件
     * @param {*} fcViewInstance
     */
  mounted (fcViewInstance) {
    if (needImportColorParams(fcViewInstance)) {
      fcViewInstance.apolloApp?.tseSupporter?.mountFcView(fcViewInstance)
    }
  }

  updateProps (fcViewInstance) {
    this.checkColorValue(fcViewInstance)
  }

  checkColorValue (fcViewInstance) {
    if (fcViewInstance.componentDefinition && fcViewInstance.componentDefinition.props) {
      const colorProps = fcViewInstance.componentDefinition.props.filter(p => p.type === 'color')

      for (const colorProp of colorProps) {
        if (fcViewInstance.instancePropConfig[colorProp.name]) {
          /**
                     对于组件颜色属性接收 var(acn,#ddd) 属性时转换为#ddd 其他情况，一律不做处理
                        var(acn,#ddd) -> #ddd
                        var(--acn,#ddd) -> var(--acn,#ddd)
                        #ddd -> #ddd
                     */
          if (fcViewInstance.instancePropConfig[colorProp.name].indexOf('--') === -1) {
            fcViewInstance.instancePropConfig[colorProp.name] = parseValueForTranslateColorValues(fcViewInstance.instancePropConfig[colorProp.name])
          }
        }
      }
    }
  }

  /**
     * 销毁触发
     * @param {*} fcViewInstance
     */
  unmount (fcViewInstance) {
    fcViewInstance.apolloApp?.tseSupporter?.unmountFcView(fcViewInstance)
  }
}

function needImportColorParams (fcViewInstance) {
  return Array.isArray(fcViewInstance?.componentDefinition?.originColors)
}
