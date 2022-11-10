import './animation.css'
import ViewDecorator from './view_decorator.js'

export default class AnimationDecorator extends ViewDecorator {
  mounted (fcViewInstance) {
    this.renderAnimation(fcViewInstance)
  }

  /**
     * 渲染组件的动画属性
     */
  renderAnimation (fcViewInstance) {
    if (fcViewInstance.fcInstanceConfig.animation && fcViewInstance.fcInstanceConfig.animation.switchAnimation && fcViewInstance.el) {
      fcViewInstance.el.style.animationFillMode = 'backwards'

      switch (fcViewInstance.fcInstanceConfig.animation.animationName) {
        case 'enter':
          if (fcViewInstance.fcInstanceConfig.animation.enterAnimationWay === 'swipeDown') {
            fcViewInstance.el.style.animationName = 'translateUpDown'
            fcViewInstance.el.style.setProperty('--distance', '-' + fcViewInstance.fcInstanceConfig.animation.enterAnimationDistance + 'px')
          }
          if (fcViewInstance.fcInstanceConfig.animation.enterAnimationWay === 'swipeUp') {
            fcViewInstance.el.style.animationName = 'translateUpDown'
            fcViewInstance.el.style.setProperty('--distance', fcViewInstance.fcInstanceConfig.animation.enterAnimationDistance + 'px')
          }
          if (fcViewInstance.fcInstanceConfig.animation.enterAnimationWay === 'swipeLeft') {
            fcViewInstance.el.style.animationName = 'translateLeftRight'
            fcViewInstance.el.style.setProperty('--distance', fcViewInstance.fcInstanceConfig.animation.enterAnimationDistance + 'px')
          }
          if (fcViewInstance.fcInstanceConfig.animation.enterAnimationWay === 'swipeRight') {
            fcViewInstance.el.style.animationName = 'translateLeftRight'
            fcViewInstance.el.style.setProperty('--distance', '-' + fcViewInstance.fcInstanceConfig.animation.enterAnimationDistance + 'px')
          }
          if (fcViewInstance.fcInstanceConfig.animation.enterAnimationWay === 'gradually') {
            fcViewInstance.el.style.animationName = 'gradually'
            fcViewInstance.el.style.setProperty('--scaleFrom', 1)
            fcViewInstance.el.style.setProperty('--scaleTo', 1)
            fcViewInstance.el.style.setProperty('--opcaityFrom', 0)
            fcViewInstance.el.style.setProperty('--opcaityTo', 1)
          }
          break
        case 'scale':
          fcViewInstance.el.style.animationName = 'gradually'
          fcViewInstance.el.style.setProperty('--scaleFrom', fcViewInstance.fcInstanceConfig.animation.beginSize / 100)
          fcViewInstance.el.style.setProperty('--scaleTo', fcViewInstance.fcInstanceConfig.animation.endSize / 100)
          fcViewInstance.el.style.setProperty('--opcaityFrom', fcViewInstance.fcInstanceConfig.animation.beginOpacity / 100)
          fcViewInstance.el.style.setProperty('--opcaityTo', fcViewInstance.fcInstanceConfig.animation.endOpacity / 100)
          fcViewInstance.el.style.transformOrigin = 'center'
          break
        default:
          break
      }

      // fcViewInstance.el.style['--distance'] = fcViewInstance.fcInstanceConfig.animation.enterAnimationDistance + 'px';
      fcViewInstance.el.style.animationDuration = fcViewInstance.fcInstanceConfig.animation.animationTime + 'ms'
      fcViewInstance.el.style.animationDelay = fcViewInstance.fcInstanceConfig.animation.waitTime + 'ms'
    }
  }
}
