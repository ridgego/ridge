import React from 'react'

const PopColorPicker = (props) => {
  return (
    <input
      type='color' value={props.value} onChange={e => {
        props.onChange(e.target.value)
      }}
    />
  )
}

export default PopColorPicker
