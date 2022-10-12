export default ({
  ridgeRuntime,
  text,
  style,
  input
}) => {
  return (
    <div
      style={style}
      contentEditable={!ridgeRuntime}
      onInput={() => input()}
    >
      {text}
    </div>
  )
}
