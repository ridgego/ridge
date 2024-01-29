import React from 'react'
export default ({
  value = '',
  size = '',
  options,
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
      <select
        value={value}
        className={['form-select', size, validName].join(' ')} disabled={disabled} onChange={e => {
          input && input(e.target.value)
        }}
      >
        {options && options.map(op => <option value={op.value} key={op.value}>{op.label}</option>)}
      </select>
      {validState === true && <div class='valid-feedback'>{validMsg}</div>}
      {validState === false && <div class='invalid-feedback'>{invalidMsg}</div>}
    </>
  )
}
