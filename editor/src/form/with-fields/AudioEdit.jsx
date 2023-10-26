import React, { useState, useEffect } from 'react'
import { Popover, Input, withField, Select } from '@douyinfe/semi-ui'
import ridgeEditService from '../../service/RidgeEditorContext.js'

export const AudioEdit = ({
  value,
  onChange
}) => {
  const [audios, setAudios] = useState([])

  useEffect(() => {
    setAudios(ridgeEditService.appService.filterFiles(file => file.mimeType && file.mimeType.indexOf('audio') > -1).map(file => {
      console.log('audio file=>', file)
      return {
        value: file.path,
        label: file.label
      }
    }))
  }, [value])

  return (
    <Select size='small' value={value} showClear onChange={onChange}>
      {audios && audios.map(audio =>
        <Select.Option value={audio.value} key={audio.value}>
          {audio.label}
        </Select.Option>)}
    </Select>
  )
}

export default withField(AudioEdit)
