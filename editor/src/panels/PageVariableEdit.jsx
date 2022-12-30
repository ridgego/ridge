import React, { useEffect, useState } from 'react'
import { IconDelete, IconEdit, IconPlus } from '@douyinfe/semi-icons'
import { Input, Button } from '@douyinfe/semi-ui'
import PopUpCodeEdit from '../utils/PopUpCodeEdit.jsx'

import '../css/page-variables.less'
import { emit, on } from '../utils/events.js'
import { EVENT_PAGE_LOADED, EVENT_PAGE_VAR_CHANGE } from '../constant.js'

const REG_VARIABLE_NAME = '^([a-zA-Z_$\u4e00-\u9fa5][a-zA-Z\\d_$\u4e00-\u9fa5]*)$'

export default () => {
  const [variables, setVariables] = useState([])
  const [variableSelectedIndex, setVariableSelectedIndex] = useState(-1)
  const [currentEditName, setCurrentEditName] = useState('')
  const [variableSelectedEdit, setVariableSelectedEdit] = useState(false)
  const [variableEditInvalid, setVariableEditInvalid] = useState(false)

  const variableChange = (variables) => {
    setVariables(variables)
    emit(EVENT_PAGE_VAR_CHANGE, variables)
  }
  useEffect(() => {
    on(EVENT_PAGE_LOADED, ({ pageVariables }) => {
      setVariables(pageVariables)
    })
  })

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
      setCurrentEditName('')
      setVariableSelectedEdit(false)
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
    let index = variables.length + 1
    while (variables.filter(v => v.name === ('Var' + index)).length) {
      index++
    }
    variableChange([...variables, {
      name: 'Var' + index,
      save: false,
      value: ''
    }])
  }

  // 点击变量项目
  const variableItemClick = (index) => {
    // 已经点击后再次点击就是编辑
    if (variableSelectedIndex === index) {
      // 连续点击空白
      if (variableSelectedEdit === -1) {
        return
      }
      // 点击的正在编辑
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

  const InputAddon = ({ index, value }) => {
    return (
      <PopUpCodeEdit
        type='json' msg='编辑变量初始值' value={value} onChange={val => {
          variableChangeValue(index, 'value', val)
        }}
      >
        <IconEdit className='action-edit' style={{ cursor: 'pointer' }} />
      </PopUpCodeEdit>
    )
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
                      addonAfter={<InputAddon index={index} value={variable.value} />}
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
        <Button icon={<IconPlus />} onClick={variableAdd} theme='borderless' size='small' />
        <Button icon={<IconDelete />} onClick={variableDelete} theme='borderless' size='small' />
      </div>
    </div>
  )
}
