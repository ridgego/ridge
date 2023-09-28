import { useRef, useEffect }, React from 'react'
import Ridge from 'ridge-runtime'

export default ({
  url
}) => {
  const ref = useRef(null)


  useEffect(() => {
    const ridge = new Ridge()
  })

  return <div ref={ref} className='ridge-view'/>
}