import React, { useState } from 'react'
import { Select, RadioGroup, Radio, Input, TextArea, Space, withField, Button, Tabs, TabPane, Slider, InputNumber, List } from '@douyinfe/semi-ui'
import { PopColorPicker } from './ColorPicker.jsx'

/**
 * 背景色编辑，支持单色、线性渐变
 */
const BackgroundEdit = ({
  value,
  onChange
}) => {
  const val = (typeof value !== 'string') ? '#fff' : value
  const si = val.match(/[0-9]+deg|\s[^%]+%/g)

  let color, colors, deg
  let listColors = []

  if (si == null || si.length < 3) {
    color = val
    listColors.push({
      color
    })
  } else {
    deg = parseInt(si[0]) || 0
    colors = si.slice(1)
    listColors.push(...colors.map(c => {
      const v = c.trim().split(/\s+/)
      return {
        color: v[0],
        percent: parseInt(v[1])
      }
    }))
  }

  const colorChange = (index, val) => {
    listColors = listColors.map((v, i) => {
      return {
        color: (i === index ? val : v.color),
        percent: v.percent
      }
    })
    outputColor()
  }
  const percentChange = (index, val) => {
    listColors = listColors.map((v, i) => {
      return {
        color: v.color,
        percent: (i === index ? val : v.percent)
      }
    })
    outputColor()
  }

  const updateList = (index) => {
    if (index) {
      listColors = listColors.filter((v, i) => i !== index)
    } else {
      listColors.push({
        color: '#fff',
        percent: 100
      })
    }
    outputColor()
  }

  const outputColor = () => {
    if (listColors.length === 1) {
      onChange(listColors[0].color)
    } else {
      onChange(`linear-gradient(${deg || 0}deg, ${listColors.map((v, i) => {
        let percent = v.percent
        if (i === 0) {
          percent = 0
        }
        if (i === listColors.length - 1) {
          percent = 100
        }
          return v.color + ' ' + percent + '%'
        }).join(', ')})`)
    }
  }

  const degChange = val => {
    deg = val
    outputColor()
  }

  return (
    <div className='background-edit'>
      <div className='color-list'>
        <List
          dataSource={listColors}
          size='small'
          renderItem={(item, index) => {
            let percent = item.percent || 0
            let disabled = false
            if (index === 0) {
              percent = 0
              disabled = true
            }
            if (index === listColors.length - 1) {
              percent = 100
              disabled = true
            }
            return (
              <Space style={{ width: '100%' }}>
                <PopColorPicker value={item.color} onChange={val => colorChange(index, val)} />
                {index > 0 &&
                  <div style={{ flex: 1 }}>
                    <Slider value={percent} disabled={disabled} onChange={val => percentChange(index, val)} />
                  </div>}
                {/* {(index !== 0 && index !== listColors.length - 1) && <InputNumber width={100} size='small' value={item.percent || 0} />} */}
                {index > 0 && <Button icon={<i class='bi bi-x-lg' />} size='small' type='danger' onClick={() => updateList(index)} style={{ marginRight: 4 }} />}
              </Space>
            )
          }}
        />
        {listColors.length > 1 &&
          <Space>
            <InputNumber insetLabel='渐变角度' size='small' value={deg} onChange={val => degChange(val)} />
          </Space>}
      </div>
      <div style={{ fontSize: 14 }}>
        <Button size='small' theme='borderless' icon={<i class='bi bi-plus-lg' />} onClick={() => updateList()} />
      </div>
    </div>
  )
}

export default withField(BackgroundEdit)
