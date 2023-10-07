import React, { useRef, useEffect } from 'react'
import Ridge from '../Ridge.js'

const ridge = new Ridge({
  baseUrl: '/npm'
})

export default ({
  app,
  page
}) => {
  const ref = useRef(null)

  useEffect(() => {
    ridge.mountPage(ref.current, app, page)
  }, [app, page])

  return (
    <div
      ref={ref}
      className='ridge-view'
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}
