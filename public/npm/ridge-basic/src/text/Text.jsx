export default ({
  text,
  style
}) => {
  const stl = Object.assign({
    width: '100%',
    height: '100%'
  }, style ?? {})
  return (
    <div
      style={stl}
    >
      {text}
    </div>
  )
}
