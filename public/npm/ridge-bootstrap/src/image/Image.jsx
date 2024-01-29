import React from 'react'
export default ({
  src = '',
  value,
  size = 14,
  input,
  onClick
}) => {
  const id = 'check-2'
  return (
    <div class='form-check'>
      <input
        class='form-check-input' type='checkbox' checked={value} id={id} onChange={e => {
          input && input(!value)
          onClick && onClick(!value)
        }}
      />
      <label
        class='form-check-label' for={id} style={{
          fontSize: size + 'px'
        }}
      >
        {text}
      </label>
    </div>
  )
}
