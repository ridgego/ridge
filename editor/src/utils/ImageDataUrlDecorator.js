/**
 * 对Element变化过程进行介入及修改
 */
export default class ImageDataUrlDecorator {
  /**
   * 更新属性触发
   * @param {*} wrapper 组件封装类
   */
  async setPropsConfig (wrapper) {
    const { appService } = window.Ridge

    if (wrapper.componentDefinition && wrapper.componentDefinition.props) {
      const imageProps = wrapper.componentDefinition.props.filter(prop => prop.type === 'image')
      for (const imgProp of imageProps) {
        if (wrapper.config.props[imgProp.name]) {
          wrapper.properties[imgProp.name] = await appService.getDataUrl(wrapper.config.props[imgProp.name])
        } else {
          wrapper.properties[imgProp.name] = ''
        }
        console.log('update by', wrapper.config.props[imgProp.name], wrapper.properties[imgProp.name])
      }
    }
  }

  /**
   * 销毁触发
   * @param {*} fcViewInstance
   */
  unmount (fcViewInstance) {}
}
