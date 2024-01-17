import React from 'react'
export default ({
  text = '',
  size,
  color,
  light,
  outline,
  loading,
  disabled,
  rounded,
  classNames = []
}) => {
  return (
    <p className={[].join(' ')}>
      {text}
    </p>
  )
}
