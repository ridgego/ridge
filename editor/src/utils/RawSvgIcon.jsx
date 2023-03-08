import React, { useEffect } from 'react'
export default ({
  svg
}) => {
  const ref = React.createRef()
  useEffect(() => {
    ref.current.style['-webkit-mask-image'] = `url("${decodeURI(svg)}")`
    ref.current.style.width = '16px'
    ref.current.style.height = '16px'
    ref.current.style.marginRight = '5px'
    ref.current.style.background = 'var(--semi-color-tertiary)'
    ref.current.style.backgroundRepeat = 'no-repeat'
  }, [])
  return (
    <div ref={ref} />
  )
}
