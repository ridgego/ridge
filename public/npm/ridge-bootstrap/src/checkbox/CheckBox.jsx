import React from 'react'
export default ({
  text = '',
  value,
  input,
  validState,
  validMsg,
  invalidMsg,
  onClick
}) => {
  let validName = ''
  if (validState === true) {
    validName = 'is-valid'
  } else if (validState === false) {
    validName = 'is-invalid'
  }

  return (
    <div className='form-check'>
      <input
        className={['form-check-input', validName].join(' ')} type='checkbox' checked={value === true} onChange={e => {
          input && input(!value)
          onClick && onClick(!value)
        }}
      />
      <label className={['form-check-label', validName].join(' ')}>
        {text}
      </label>
      {validState === true && <div class='valid-feedback'>{validMsg}</div>}
      {validState === false && <div class='invalid-feedback'>{invalidMsg}</div>}
    </div>
  )
}
