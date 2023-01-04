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
  return (
    <img
      style={stl}
      src={src}
    />
  )
}
