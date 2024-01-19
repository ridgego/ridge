import React from 'react'
export default ({
  text = '',
  size = 14,
  checked,
  input,
  onClick
}) => {
  const id = 'check-2'
  return (
    <div class='form-check'>
      <input
        class='form-check-input' type='checkbox' checked={checked} id={id} onChange={e => {
          input && input(!checked)
          onClick && onClick(!checked)
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
