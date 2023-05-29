export default (config, ridge, mode) => {
  if (config == null) {
    return null
  }
  if (config.type === 'color' || config.type === 'code') {
    return {
      background: config.value
    }
  } else if (config.type === 'image') {
    return {
      background: `url(${ridge.appService.getDataUrl(config.value)})`,
      backgroundSize: '100%',
      backgroundRepeat: 'no-repeat'
    }
  }
}
