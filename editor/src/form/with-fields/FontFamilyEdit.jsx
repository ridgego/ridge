import React from 'react'
import { Select, withField } from '@douyinfe/semi-ui'

const fontSupported = [
  { name: '默认', value: 'default' },
  { name: '宋体', value: 'SimSun' },
  { name: '黑体', value: 'SimHei' },
  { name: '微软雅黑', value: 'Microsoft Yahei' },
  { name: '微软正黑体', value: 'Microsoft JhengHei' },
  { name: '楷体', value: 'KaiTi' },
  { name: '新宋体', value: 'NSimSun' },
  { name: '仿宋', value: 'FangSong' },
  { name: '幼圆', value: 'YouYuan' },
  { name: '隶书', value: 'LiSu' },
  { name: '苹方', value: 'PingFang SC' }
]

const FontFamilyEdit = ({ value, onChange }) => {
  return (
    <Select size='small' value={value} onChange={onChange} showClear>
      {fontSupported.map(f => <Select.Option key={f.name} value={f.value}>{f.name}</Select.Option>)}
    </Select>
  )
}

export default withField(FontFamilyEdit)
