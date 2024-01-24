import React from 'react'
export default ({
  text = '',
  icon = '',
  type = 'text-bg-primary',
  pill = false,
  showClose = false,
  classNames = [],
  onClose,
  onClick
}) => {
  return (
    <span
      style={{ width: '100%', height: '100%' }}
      onClick={onClick}
      className={[...classNames, 'badge', 'd-flex', 'justify-content-center', 'align-items-center', type, pill ? 'rounded-pill' : ''].join(' ')}
    >
      {icon && <i className={'bi me-1 ' + icon} />}{text}
      {showClose &&
        <i
          class='bi bi-x-circle-fill ms-1' style={{ cursor: 'pointer' }} onClick={e => {
            e.stopPropagation()
            onClose && onClose()
          }}
        />}
    </span>
  )
}
