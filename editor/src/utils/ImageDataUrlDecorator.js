/**
 * 对Element变化过程进行介入及修改
 */
export default class ImageDataUrlDecorator {
  /**
   * 更新属性触发
   * @param {*} wrapper 组件封装类
   */
  updateProps (wrapper) {
    const { appService } = window.Ridge

    if (wrapper.componentDefinition && wrapper.componentDefinition.props) {
      const imageProps = wrapper.componentDefinition.props.filter(prop => prop.type === 'image')

      imageProps.forEach((oneProp) => {
        if (wrapper.config.props[oneProp.name] && !wrapper.properties[oneProp.name]) {
          appService.getFileByPath(wrapper.config.props[oneProp.name]).then(file => {
            wrapper.updateProperties({
              [oneProp.name]: file.dataUrl
            })
          })
        }
        if (!wrapper.config.props[oneProp.name]) {
          wrapper.properties[oneProp.name] = ''
        }
      })
    }
  }

  /**
       * 销毁触发
       * @param {*} fcViewInstance
       */
  unmount (fcViewInstance) {}
}
