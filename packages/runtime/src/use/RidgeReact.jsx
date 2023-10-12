import React, { useRef, useEffect } from 'react'
import RidgeContext from '../Ridge.js'

const ridge = new RidgeContext({
  baseUrl: '/npm'
})

export default ({
  app,
  page,
  globalContext = true,
  baseUrl
}) => {
  const ref = useRef(null)


  useEffect(() => {
    let context = ref.ridgeContext
    if (globalContext) {
      context = globalThis.ridgeContext
      if (context == null) {
        globalThis.ridgeContext = new RidgeContext({
          baseUrl: baseUrl || '/npm'
        })
        context = globalThis.ridgeContext
      }
    } else {
      context = ref.ridgeContext = new RidgeContext({
        baseUrl: baseUrl || '/npm'
      })
    }
    ref.ridgeContext.mountPage(ref.current, app, page)
  }, [app, page])

  return (
    <div
      ref={ref}
      className='composite-view'
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}
