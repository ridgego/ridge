import { useRef, useEffect }, React from 'react'
import Ridge from 'ridge-runtime'

export default ({
  app,
  page
}) => {
  const ref = useRef(null)


  useEffect(() => {
    ridge.mountPage(ref.current, app, page)
  }, [app, page])

  return <div ref={ref} className='ridge-view' style={{
    width: '100%',
    height: '100%'
  }}/>
}