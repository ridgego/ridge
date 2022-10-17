export default (props) => {
  const style = Object.assign({
    width: '100%',
    height: '100%'
  }, props.style ?? {})
  return (
    <div
      style={style}
    />
  )
}
