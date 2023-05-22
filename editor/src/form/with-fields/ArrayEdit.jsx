import React, { useState } from 'react'
import { IconPlusCircle, IconMinusCircle } from '@douyinfe/semi-icons'
import { withField, Button, Popover, Input, List, Pagination } from '@douyinfe/semi-ui'

const ArrayEdit = withField(({
  value, onChange, options
}) => {
  const data = value || []
  const [page, onPageChange] = useState(1)
  const pageSize = 6
  const getData = (page) => {
    const start = (page - 1) * pageSize
    const end = page * pageSize
    return data.slice(start, end)
  }
  const addNew = () => {
    onChange([...data, JSON.parse(JSON.stringify(options.item))])
  }
  const removeItem = index => {
    onChange(data.filter((v, i) => i !== (page - 1) * pageSize + index))
  }
  const changeItem = (key, val, index) => {
    onChange(data.map((item, i) => {
      if (i === (page - 1) * pageSize + index) {
        if (key) {
          return Object.assign(item, {
            [key]: val
          })
        } else {
          return val
        }
      } else {
        return item
      }
    })
    )
  }

  const renderItem = (item, index) => {
    let itemContent = null
    if (typeof item === 'string') {
      itemContent = (
        <Input
          onChange={(val) => {
            changeItem('', val, index)
          }} value={item} size='small'
        />
      )
    } else {
      // object
      const keys = Object.keys(item)
      itemContent = (
        <>
          {keys.map(key =>
            <Input
              key={key}
              onChange={(val) => {
                changeItem(key, val, index)
              }} value={item[key]} size='small'
            />)}
        </>
      )
    }
    return (
      <div style={{ margin: 4, gap: 4, display: 'flex' }} className='list-item'>
        {itemContent}
        <Button size='small' type='danger' theme='borderless' icon={<IconMinusCircle />} onClick={() => removeItem(index)} style={{ marginRight: 4 }} />
      </div>
    )
  }
  return (
    <>
      <List
        dataSource={getData(page)}
        split={false}
        size='small'
        className='component-list-demo-booklist'
        style={{ border: '1px solid var(--semi-color-border)', flexBasis: '100%', flexShrink: 0 }}
        renderItem={renderItem}
      />
      <div style={{ margin: 4, fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
        <Button size='small' theme='borderless' icon={<IconPlusCircle />} onClick={() => addNew()} style={{ marginRight: 4, color: 'var(--semi-color-info)' }}>新增项</Button>
        <div>
          {data.length > pageSize && <Pagination size='small' style={{ height: 24, width: '100%', flexBasis: '100%', justifyContent: 'center' }} pageSize={pageSize} total={data.length} currentPage={page} onChange={cPage => onPageChange(cPage)} />}
        </div>
      </div>
    </>
  )
})

export default ArrayEdit
