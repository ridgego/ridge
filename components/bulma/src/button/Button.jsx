import React from 'react'
export default ({
  classNames = []
}) => {
  return <button className={[...classNames, 'button'].join(' ')} />
}
