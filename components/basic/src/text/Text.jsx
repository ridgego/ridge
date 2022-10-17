export default ({
  ridgeRuntime,
  text,
  style,
  input
}) => {
  const stl = Object.assign({
    width: '100%',
    height: '100%'
  }, style ?? {})
  return (
    <div
      style={stl}
      contentEditable={!ridgeRuntime}
      onInput={() => input()}
    >
      {text}
    </div>
  )
}
