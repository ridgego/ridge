import React from 'react'
import './style.css'

const DEFAULT_SVG_PATH = document.currentScript.src.split('/').slice(0, -2).join('/') + '/svgs'
export default ({
  value,
  color = '#F5A623',
  ...props
}) => {
  const map = Object.assign({
    daySunny: DEFAULT_SVG_PATH + '/day-sunny.svg',
    nightClear: DEFAULT_SVG_PATH + '/night-clear.svg',
    cloudy: DEFAULT_SVG_PATH + '/cloudy.svg',
    rain: DEFAULT_SVG_PATH + '/rain.svg',
    snow: DEFAULT_SVG_PATH + '/snow.svg',
    stormShowers: DEFAULT_SVG_PATH + '/storm-showers.svg',
    fog: DEFAULT_SVG_PATH + '/fog.svg'
  }, props)
  return (
    <div
      className='weather-icon' style={{
        width: '100%',
        height: '100%',
        '-webkit-mask-image': `url(${map[value] ?? map.daySunny})`,
        maskImage: `url(${map[value] ?? map.daySunny})`,
        background: color
      }}
    />
  )
}
