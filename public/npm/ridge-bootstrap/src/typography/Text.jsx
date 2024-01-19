import React from 'react'
export default ({
  text = '',
  size = 14,
  color,
  decoration,
  verticalAlign,
  textAlign,
  padding,
  style
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        fontSize: size + 'px',
        padding: padding + 'px',
        textDecoration: decoration,
        display: 'flex',
        alignItems: verticalAlign,
        justifyContent: textAlign,
        color
      }} className={style}
    >{text}
    </div>
  )
}
