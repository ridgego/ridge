import React from 'react'
export default ({
  value = '',
  size = 14,
  placeholder,
  validState,
  validMsg,
  invalidMsg,
  disabled,
  input
}) => {
  let validName = ''
  if (validState === true) {
    validName = 'is-valid'
  } else if (validState === false) {
    validName = 'is-invalid'
  }
  return (
    <>
      <input
        style={{
          width: '100%',
          fontSize: size + 'px'
        }}
        disabled={disabled}
        type='text' className={['form-control', validName].join(' ')} placeholder={placeholder} value={value} onChange={e => {
          input && input(e.target.value)
        }}
      />
      {validState === true && <div class='valid-feedback'>{validMsg}</div>}
      {validState === false && <div class='invalid-feedback'>{invalidMsg}</div>}
    </>
  )
}
