import React, { useState } from 'react'
import { IconDelete, IconEdit, IconPlus } from '@douyinfe/semi-icons'
import { Input } from '@douyinfe/semi-ui'

import '../css/variable-list.less'

const REG_VARIABLE_NAME = '^([a-zA-Z_$\u4e00-\u9fa5][a-zA-Z\\d_$\u4e00-\u9fa5]*)$'

export default ({
  variables,
  variableChange
}) => {
  const [variableSelectedIndex, setVariableSelectedIndex] = useState(-1)
  const [currentEditName, setCurrentEditName] = useState('')
  const [variableSelectedEdit, setVariableSelectedEdit] = useState(false)
  const [variableEditInvalid, setVariableEditInvalid] = useState(false)

  // 修改变量字段
  const variableChangeValue = (index, key, value) => {
    variableChange(variables.map((variable, i) => {
      if (i === index) {
        return { ...variable, [key]: value }
      } else {
        return variable
      }
    }))
  }

  // 删除变量
  const variableDelete = name => {
    if (variableSelectedIndex > -1) {
      variableChange(variables.filter(variable => variable !== variables[variableSelectedIndex]))
    }
  }

  // 变量重命名
  const variableNameChange = (index, val) => {
    setCurrentEditName(val)

    if (!val.match(REG_VARIABLE_NAME)) {
      setVariableEditInvalid(true)
    } else {
      let dup = false
      variables.forEach((v, i) => {
        if (i !== index && v.name === val) {
          dup = true
        }
      })
      if (dup) {
        setVariableEditInvalid(true)
      } else {
        setVariableEditInvalid(false)
        variableChange(variables.map((v, i) => {
          if (i === index) {
            return Object.assign(v, {
              name: val
            })
          } else {
            return v
          }
        }))
      }
    }
  }

  // 新增变量
  const variableAdd = () => {
    variableChange([...variables, {
      name: '变量' + (variables.length + 1),
      save: false,
      value: ''
    }])
  }

  // 点击变量项目
  const variableItemClick = (index) => {
    // 已经点击后再次点击就是编辑
    if (variableSelectedIndex === index) {
      if (variableSelectedEdit) {
        return
      }
      setCurrentEditName(variables[index].name)
      setVariableSelectedEdit(true)
    } else {
      // 点击其他位置切换编辑位置
      setVariableSelectedEdit(false)
      setCurrentEditName('')
      setVariableSelectedIndex(index)
    }
  }

  const openEditCode = (value, index) => {
    const { Ridge } = window

    Ridge && Ridge.openCodeEditor &&
    Ridge.openCodeEditor({
      lang: 'js',
      code: value,
      completed: (newCode) => {
        variableChangeValue(index, 'value', newCode)
      }
    })
  }

  return (
    <div className='variable-list'>
      <div className='item-list' onClick={() => { variableItemClick(-1) }}>
        {variables.map((variable, index) => {
          return (
            <div
              className={'item ' + (variableSelectedIndex === index ? 'selected' : '')} key={index} onClick={e => {
                variableItemClick(index)
                e.stopPropagation()
                e.preventDefault()
              }}
            >
              {variableSelectedEdit && variableSelectedIndex === index &&
                <div className='edit-line'>
                  <div className='edit-name'>
                    <Input
                      size='small'
                      validateStatus={variableEditInvalid ? 'error' : 'default'}
                      value={currentEditName} onChange={(val) => {
                        variableNameChange(index, val)
                      }}
                    />
                  </div>
                  <div className='edit-value'>
                    <Input
                      size='small'
                      value={variable.value} onChange={(val) => {
                        variableChangeValue(index, 'value', val)
                      }}
                      addonAfter={<IconEdit className='action-edit' style={{ cursor: 'pointer' }} onClick={() => openEditCode(variable.value, index)} />}
                    />
                  </div>
                </div>}
              {(!variableSelectedEdit || variableSelectedIndex !== index) &&
                     (
                       <>
                         <div className='name'>{variable.name}</div>
                         <div className='value'>{variable.value}</div>
                       </>
                     )}
            </div>
          )
        })}
      </div>
      <div className='bottom-bar'>
        <IconPlus onClick={variableAdd} />
        <IconDelete onClick={variableDelete} />
      </div>
    </div>
  )
}
