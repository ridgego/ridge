import React from 'react'
export default ({
  text = '',
  type = 'primary',
  size = 14,
  outline,
  disabled,
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
      className={['btn',
        outline ? 'btn-outline-' + type : 'btn-' + type
      ].join(' ')}
      disabled={disabled}
    >{text}
    </button>
  )
}
