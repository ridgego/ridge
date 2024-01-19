import React from 'react'
export default ({
  value = '',
  size = 14,
  placeholder,
  invalid,
  disabled,
  input
}) => {
  return (
    <input
      style={{
        width: '100%',
        height: '100%',
        fontSize: size + 'px'
      }}
      type='text' className={['form-control', invalid ? 'is-invalid' : ''].join(' ')} placeholder={placeholder} value={value} onChange={e => {
        input && input(e.target.value)
      }}
    />
  )
}
