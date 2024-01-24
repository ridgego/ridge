import React from 'react'
export default ({
  icon = 'bi-bag-check',
  size,
  color
}) => {
  return (
    <i
      className={'bi ' + icon} style={{
        fontSize: size,
        color
      }}
    />
  )
}
