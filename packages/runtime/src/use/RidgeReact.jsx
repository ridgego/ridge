import React, { useRef, useEffect } from 'react'
import RidgeContext from '../Ridge.js'

export default ({
  app,
  page,
  ridge,
  ...args
}) => {
  const ref = useRef(null)

  const getRidgeContext = () => {
    if (ridge) {
      return ridge
    } else {
      return globalThis.ridge ?? new RidgeContext({
        baseUrl: 'https://cdn.jsdelivr.net/npm/'
      })
    }
  }

  const getEventAndProperties = () => {
    const events = {}
    const properties = {}
    for (const key in args ?? {}) {
      if (typeof args[key] === 'function') {
        events[key] = args[key]
      } else {
        properties[key] = args[key]
      }
    }
    return { events, properties }
  }

  useEffect(() => {
    const context = getRidgeContext()

    // 页面改变了重新挂载
    if (ref.current.ridgeComposite) {
      ref.current.ridgeComposite.unmount()
    }
    const { events, properties } = getEventAndProperties()

    context.createComposite(app, page, properties).then(composite => {
      if (composite) {
        for (const key in events ?? {}) {
          composite.on(key, (...payload) => {
            events[key].apply(null, payload)
          })
        }
        composite.mount(ref.current)
        ref.current.ridgeComposite = composite
      }
    })
  }, [app, page])

  useEffect(() => {
    if (ref.current.ridgeComposite) {
      const { properties } = getEventAndProperties()
      ref.current.ridgeComposite.store.setProperties(properties)
    }
  })

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
