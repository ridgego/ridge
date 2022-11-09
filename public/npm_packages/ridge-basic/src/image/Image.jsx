export default ({
  ridgeRuntime,
  src,
  text,
  style
}) => {
  const stl = Object.assign({
    width: '100%',
    height: '100%'
  }, style ?? {})
  return (
    <img
      style={stl}
      src={src}
    />
  )
}
