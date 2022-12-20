export const pe = (val) => {
  try {
    return JSON.parse(val)
  } catch (e) {
    return val
  }
}

export const st = (val) => {
  return JSON.stringify(val)
}
