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
  onClick,
  classNames = []
}) => {
  return (
    <button
      onClick={onClick}
      className={[...classNames,
        light ? 'is-light' : '',
        outline ? 'is-outlined' : '',
        loading ? 'is-loading' : '',
        rounded ? 'is-rounded' : '',
        size, color, 'button'].join(' ')}
      disabled={disabled}
    >{text}
    </button>
  )
}
