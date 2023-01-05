export default ({
  src,
  objectFit
}) => {
  const stl = Object.assign({
    width: '100%',
    height: '100%'
  }, {
    objectFit
  })
  console.log('render image with src', src)
  return (
    <>
      {src && <img
        style={stl}
        src={src}
              />}
      {!src && <div style={{
        ...stl,
        backgrond: 'rgba(ff,0,0,.3)'
      }}
               />}
    </>
  )
}
