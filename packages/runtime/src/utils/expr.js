export const pe = (val) => {
  try {
    return JSON.parse(val)
  } catch (e) {
    return val
  }
}
