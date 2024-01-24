import React from 'react'
export default ({
  text = '',
  value,
  size = 14,
  input,
  classNames,
  onClick
}) => {
  return (
    <span className='badge d-flex align-items-center p-1 pe-2 text-warning-emphasis bg-warning-subtle border border-warning-subtle rounded-pill'>
      <img class='rounded-circle me-1' width='24' height='24' src='https://github.com/mdo.png' alt='' />Warning
    </span>
  )
}
