/* global FileReader MouseEvent */
const dataURLtoBlob = async (dataURL) => {
  const res = await fetch(dataURL)
  const blob = await res.blob()
  return blob
}

const dataURLToString = async dataURL => {
  const blob = await dataURLtoBlob(dataURL)
  return await blob.text()
}

const stringToDataUrl = async (content, type) => {
  const blob = new Blob([content], { type })

  return await blobToDataUrl(blob)
}

const blobToDataUrl = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => {
      // convert image file to base64 string
      resolve(reader.result)
    }, false)
    reader.readAsDataURL(file)
  })
}

const saveAs = (blob, name) => {
  // see FileSaver.js
  // saveAs(content, 'example.zip')
  const a = document.createElement('a')
  if (blob instanceof Blob) {
    a.href = window.URL.createObjectURL(blob)
  } else {
    a.href = window.URL.createObjectURL(new Blob([blob], {
      type: 'text/plain'
    }))
  }
  a.download = name || blob.name || '下载'
  a.rel = 'noopener'
  setTimeout(function () { URL.revokeObjectURL(a.href) }, 4E4) // 40s
  setTimeout(function () { click(a) }, 0)
}

function click (node) {
  try {
    node.dispatchEvent(new MouseEvent('click'))
  } catch (e) {
    const evt = document.createEvent('MouseEvents')
    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
      20, false, false, false, false, 0, null)
    node.dispatchEvent(evt)
  }
}

export {
  saveAs,
  stringToDataUrl,
  dataURLToString,
  blobToDataUrl,
  dataURLtoBlob
}
