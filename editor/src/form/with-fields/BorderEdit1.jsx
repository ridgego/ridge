import React from 'react'
import PopColorPicker from './PopColorPicker.jsx'
import { border } from 'ridge-prop-utils'
import { IconChevronDown, IconChevronUp, IconEditStroked } from '@douyinfe/semi-icons'
import { Select, Space, withField, Button, InputNumber, Popover, Icon, Typography } from '@douyinfe/semi-ui'

const IconBorderTop = () => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-border-top' viewBox='0 0 16 16'>
      <path d='M0 0v1h16V0H0zm1 2.844v-.938H0v.938h1zm6.5-.938v.938h1v-.938h-1zm7.5 0v.938h1v-.938h-1zM1 4.719V3.78H0v.938h1zm6.5-.938v.938h1V3.78h-1zm7.5 0v.938h1V3.78h-1zM1 6.594v-.938H0v.938h1zm6.5-.938v.938h1v-.938h-1zm7.5 0v.938h1v-.938h-1zM.5 8.5h.469v-.031H1V7.53H.969V7.5H.5v.031H0v.938h.5V8.5zm1.406 0h.938v-1h-.938v1zm1.875 0h.938v-1H3.78v1zm1.875 0h.938v-1h-.938v1zm2.813 0v-.031H8.5V7.53h-.031V7.5H7.53v.031H7.5v.938h.031V8.5h.938zm.937 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875 0h.469v-.031h.5V7.53h-.5V7.5h-.469v.031H15v.938h.031V8.5zM0 9.406v.938h1v-.938H0zm7.5 0v.938h1v-.938h-1zm8.5.938v-.938h-1v.938h1zm-16 .937v.938h1v-.938H0zm7.5 0v.938h1v-.938h-1zm8.5.938v-.938h-1v.938h1zm-16 .937v.938h1v-.938H0zm7.5 0v.938h1v-.938h-1zm8.5.938v-.938h-1v.938h1zM0 16h.969v-.5H1v-.469H.969V15H.5v.031H0V16zm1.906 0h.938v-1h-.938v1zm1.875 0h.938v-1H3.78v1zm1.875 0h.938v-1h-.938v1zm1.875-.5v.5h.938v-.5H8.5v-.469h-.031V15H7.53v.031H7.5v.469h.031zm1.875.5h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875-.5v.5H16v-.969h-.5V15h-.469v.031H15v.469h.031z' />
    </svg>
  )
}

const IconBorderBottom = () => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-border-bottom' viewBox='0 0 16 16'>
      <path d='M.969 0H0v.969h.5V1h.469V.969H1V.5H.969V0zm.937 1h.938V0h-.938v1zm1.875 0h.938V0H3.78v1zm1.875 0h.938V0h-.938v1zM7.531.969V1h.938V.969H8.5V.5h-.031V0H7.53v.5H7.5v.469h.031zM9.406 1h.938V0h-.938v1zm1.875 0h.938V0h-.938v1zm1.875 0h.938V0h-.938v1zm1.875 0h.469V.969h.5V0h-.969v.5H15v.469h.031V1zM1 2.844v-.938H0v.938h1zm6.5-.938v.938h1v-.938h-1zm7.5 0v.938h1v-.938h-1zM1 4.719V3.78H0v.938h1zm6.5-.938v.938h1V3.78h-1zm7.5 0v.938h1V3.78h-1zM1 6.594v-.938H0v.938h1zm6.5-.938v.938h1v-.938h-1zm7.5 0v.938h1v-.938h-1zM.5 8.5h.469v-.031H1V7.53H.969V7.5H.5v.031H0v.938h.5V8.5zm1.406 0h.938v-1h-.938v1zm1.875 0h.938v-1H3.78v1zm1.875 0h.938v-1h-.938v1zm2.813 0v-.031H8.5V7.53h-.031V7.5H7.53v.031H7.5v.938h.031V8.5h.938zm.937 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875 0h.469v-.031h.5V7.53h-.5V7.5h-.469v.031H15v.938h.031V8.5zM0 9.406v.938h1v-.938H0zm7.5 0v.938h1v-.938h-1zm8.5.938v-.938h-1v.938h1zm-16 .937v.938h1v-.938H0zm7.5 0v.938h1v-.938h-1zm8.5.938v-.938h-1v.938h1zm-16 .937v.938h1v-.938H0zm7.5 0v.938h1v-.938h-1zm8.5.938v-.938h-1v.938h1zM0 15h16v1H0v-1z' />
    </svg>
  )
}

const IconBorderAll = () => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-border-outer' viewBox='0 0 16 16'>
      <path d='M7.5 1.906v.938h1v-.938h-1zm0 1.875v.938h1V3.78h-1zm0 1.875v.938h1v-.938h-1zM1.906 8.5h.938v-1h-.938v1zm1.875 0h.938v-1H3.78v1zm1.875 0h.938v-1h-.938v1zm2.813 0v-.031H8.5V7.53h-.031V7.5H7.53v.031H7.5v.938h.031V8.5h.938zm.937 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zM7.5 9.406v.938h1v-.938h-1zm0 1.875v.938h1v-.938h-1zm0 1.875v.938h1v-.938h-1z' />
      <path d='M0 0v16h16V0H0zm1 1h14v14H1V1z' />
    </svg>
  )
}

const IconBorderLeft = () => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-border-left' viewBox='0 0 16 16'>
      <path d='M0 0v16h1V0H0zm1.906 1h.938V0h-.938v1zm1.875 0h.938V0H3.78v1zm1.875 0h.938V0h-.938v1zM7.531.969V1h.938V.969H8.5V.5h-.031V0H7.53v.5H7.5v.469h.031zM9.406 1h.938V0h-.938v1zm1.875 0h.938V0h-.938v1zm1.875 0h.938V0h-.938v1zm1.875 0h.469V.969h.5V0h-.969v.5H15v.469h.031V1zM7.5 1.906v.938h1v-.938h-1zm7.5 0v.938h1v-.938h-1zM7.5 3.781v.938h1V3.78h-1zm7.5 0v.938h1V3.78h-1zM7.5 5.656v.938h1v-.938h-1zm7.5 0v.938h1v-.938h-1zM1.906 8.5h.938v-1h-.938v1zm1.875 0h.938v-1H3.78v1zm1.875 0h.938v-1h-.938v1zm2.813 0v-.031H8.5V7.53h-.031V7.5H7.53v.031H7.5v.938h.031V8.5h.938zm.937 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875 0h.469v-.031h.5V7.53h-.5V7.5h-.469v.031H15v.938h.031V8.5zM7.5 9.406v.938h1v-.938h-1zm8.5.938v-.938h-1v.938h1zm-8.5.937v.938h1v-.938h-1zm8.5.938v-.938h-1v.938h1zm-8.5.937v.938h1v-.938h-1zm8.5.938v-.938h-1v.938h1zM1.906 16h.938v-1h-.938v1zm1.875 0h.938v-1H3.78v1zm1.875 0h.938v-1h-.938v1zm1.875-.5v.5h.938v-.5H8.5v-.469h-.031V15H7.53v.031H7.5v.469h.031zm1.875.5h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875-.5v.5H16v-.969h-.5V15h-.469v.031H15v.469h.031z' />
    </svg>
  )
}

const IconBorderRight = () => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-border-right' viewBox='0 0 16 16'>
      <path d='M.969 0H0v.969h.5V1h.469V.969H1V.5H.969V0zm.937 1h.938V0h-.938v1zm1.875 0h.938V0H3.78v1zm1.875 0h.938V0h-.938v1zM7.531.969V1h.938V.969H8.5V.5h-.031V0H7.53v.5H7.5v.469h.031zM9.406 1h.938V0h-.938v1zm1.875 0h.938V0h-.938v1zm1.875 0h.938V0h-.938v1zM16 0h-1v16h1V0zM1 2.844v-.938H0v.938h1zm6.5-.938v.938h1v-.938h-1zM1 4.719V3.78H0v.938h1zm6.5-.938v.938h1V3.78h-1zM1 6.594v-.938H0v.938h1zm6.5-.938v.938h1v-.938h-1zM.5 8.5h.469v-.031H1V7.53H.969V7.5H.5v.031H0v.938h.5V8.5zm1.406 0h.938v-1h-.938v1zm1.875 0h.938v-1H3.78v1zm1.875 0h.938v-1h-.938v1zm2.813 0v-.031H8.5V7.53h-.031V7.5H7.53v.031H7.5v.938h.031V8.5h.938zm.937 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zM0 9.406v.938h1v-.938H0zm7.5 0v.938h1v-.938h-1zM0 11.281v.938h1v-.938H0zm7.5 0v.938h1v-.938h-1zM0 13.156v.938h1v-.938H0zm7.5 0v.938h1v-.938h-1zM0 16h.969v-.5H1v-.469H.969V15H.5v.031H0V16zm1.906 0h.938v-1h-.938v1zm1.875 0h.938v-1H3.78v1zm1.875 0h.938v-1h-.938v1zm1.875-.5v.5h.938v-.5H8.5v-.469h-.031V15H7.53v.031H7.5v.469h.031zm1.875.5h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1zm1.875 0h.938v-1h-.938v1z' />
    </svg>
  )
}

const { Text } = Typography
const BorderEdit = withField(({
  value,
  onChange
}) => {
  const toArray = (value) => {
    const border = value.split(' ')
    border[0] = parseInt(border[0]) || 0
    return border
  }

  const fromArray = (border) => {
    return border[0] + 'px' + ' ' + border[1] + ' ' + border[2]
  }

  const renderExpand = () => {
    return (
      <Button
        theme='borderless' type='tertiary' size='small' icon={
          <IconChevronDown />
      } onClick={() => {
        onChange([value, value, value, value])
      }}
      />
    )
  }
  const renderCollapse = () => {
    return (
      <Button
        theme='borderless' type='tertiary' size='small' icon={
          <IconChevronUp />
      } onClick={() => {
        onChange(value[0])
      }}
      />
    )
  }

  const borderChange = (border, index) => {
    onChange(value.map((item, i) => (i === index) ? border : item))
  }

  // 渲染单行
  const renderBorder = (border, output, btn) => {
    return (
      <Space spacing={2}>
        <InputNumber
          style={{
            width: '64px'
          }}
          size='small'
          value={border[0]} onChange={value => {
            border[0] = value
            output(fromArray(border))
          }}
        /> <Select
          value={border[1]} optionList={[{
            label: '实线',
            value: 'solid'
          }, {
            label: '点划线',
            value: 'dashed'
          }]}
          size='small'
          onChange={value => {
            border[1] = value
            output(fromArray(border))
          }}
           />
        <PopColorPicker
          value={border[2]} onChange={value => {
            border[2] = value
            output(fromArray(border))
          }}
        />
        {btn && btn()}
      </Space>
    )
  }

  const renderPopContent = () => {
    return (
      <div>
        <Icon svg={<IconBorderLeft />} />
        <Icon svg={<IconBorderRight />} />
        <Icon svg={<IconBorderBottom />} />
        <Icon svg={<IconBorderTop />} />
        <Icon svg={<IconBorderAll />} />
      </div>
    )
  }

  return (
    <div
      className='border-edit' style={{
        display: 'flex',
        width: '56px',
        justifyContent: 'space-between'
      }}
    >
      <div style={{
        width: '22px',
        height: '22px',
        ...border.style({
          border: value
        })
      }}
      />
      <Popover content={renderPopContent}>
        <Button size='small' icon={<IconEditStroked />} />
      </Popover>
    </div>
  )
})

export default BorderEdit
