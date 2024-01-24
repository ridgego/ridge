import React from 'react'
export default ({
  text = '',
  type = 'primary',
  size = 14,
  btnSize = '',
  outline,
  disabled,
  classNames = [],
  icon,
  onClick
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      style={{
        fontSize: size + 'px',
        width: '100%',
        height: '100%'
      }}
      className={['btn', btnSize, ...classNames,
        outline ? 'btn-outline-' + type : 'btn-' + type
      ].join(' ')}
      disabled={disabled}
    >
      {icon && <i className={'bi ' + icon} />}
      {text}
    </button>
  )
}
