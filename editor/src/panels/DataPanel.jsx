import React from 'react'
import MoveablePanel from './MoveablePanel.jsx'
import { IconDelete, IconEdit } from '@douyinfe/semi-icons'
import { Table, Input, Select, TextArea, List, Tabs, TabPane, Button, InputNumber, Checkbox } from '@douyinfe/semi-ui'

import '../css/data-panel.less'
import { EVENT_PAGE_LOADED, EVENT_PAGE_VAR_CHANGE } from '../constant.js'

const REG_VARIABLE_NAME = '^([a-zA-Z_$\u4e00-\u9fa5][a-zA-Z\\d_$\u4e00-\u9fa5]*)$'
export default class DataPanel extends React.Component {
  constructor () {
    super()
    this.state = {
      variableSelectedIndex: -1,
      variableEditInvalid: false,
      currentEditName: '',
      show: true,
      variables: []
    }
  }

  variableChange (index, key, value) {
    this.props.variableChange(this.props.variables.map((variable, i) => {
      if (i === index) {
        return { ...variable, [key]: value }
      } else {
        return variable
      }
    }))
  }

  variableDelete (index) {
    this.state.variables.splice(index, 1)
    this.props.variableChange(this.props.variables)
  }

  variableNameChange (index, val) {
    this.setState({
      currentEditName: val
    })
    if (!val.match(REG_VARIABLE_NAME)) {
      this.setState({
        variableEditInvalid: true
      })
    } else {
      let dup = false
      this.props.variables.forEach((v, i) => {
        if (i !== index && v.name === val) {
          dup = true
        }
      })
      if (dup) {
        this.setState({
          variableEditInvalid: true
        })
      } else {
        this.setState({
          variableEditInvalid: false
        })
        this.props.variableChange(this.props.variables.map((v, i) => {
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

  variableAdd () {
    this.setState({
      variableSelectedEdit: false
    })
    this.props.variableChange([...this.props.variables, {
      name: '变量' + (this.props.variables.length + 1),
      save: false,
      initValue: ''
    }])
  }

  variableItemClick (index) {
    if (this.state.variableSelectedIndex === index) {
      this.setState({
        currentEditName: this.props.variables[index].name,
        variableSelectedEdit: true
      })
    } else {
      this.setState({
        variableSelectedIndex: index,
        variableSelectedEdit: false
      })
    }
  }

  openEditCode (value, index) {
    const { Ridge } = window

    Ridge && Ridge.openCodeEditor &&
    Ridge.openCodeEditor({
      lang: 'js',
      code: value,
      completed: (newCode) => {
        this.variableChange(index, 'value', newCode)
      }
    })
  }

  render () {
    return (
      <MoveablePanel right='10px' bottom='10px' width='300px' height='240px' {...this.props}>
        <Tabs
          type='card'
          size='small'
        >
          <TabPane size='small' tab='页面变量' itemKey='var'>
            <div className='variable-list'>
              {this.props.variables.map((variable, index) => {
                return (
                  <div
                    className={'item ' + (this.state.variableSelectedIndex === index ? 'selected' : '')} key={index} onClick={() => {
                      this.variableItemClick(index)
                    }}
                  >
                    {this.state.variableSelectedEdit && this.state.variableSelectedIndex === index &&
                      <div className='edit'>
                        <Input
                          size='small'
                          validateStatus={this.state.variableEditInvalid ? 'error' : 'default'}
                          value={this.state.currentEditName} onChange={(val) => {
                            this.variableNameChange(index, val)
                          }}
                        />
                      </div>}
                    {(!this.state.variableSelectedEdit || this.state.variableSelectedIndex !== index) &&
                     (
                       <>
                         <div className='name'>{variable.name}</div>
                         <div className='value'>{variable.value}</div>
                         <IconEdit className='action-edit' style={{ cursor: 'pointer' }} onClick={() => this.openEditCode(variable.value, index)} />
                         <IconDelete className='action-delete' onClick={() => this.variableDelete(index)} />
                       </>
                     )}
                  </div>
                )
              })}
            </div>
            {/* <Table bordered columns={columns} pagination={false} dataSource={this.state.variables} /> */}
            <Button
              size='small' type='tertiary' style={{ marginBottom: 8 }} onClick={() => {
                this.variableAdd()
              }}
            >增加变量
            </Button>
          </TabPane>
          <TabPane tab='数据' itemKey='data' />
          <TabPane tab='资源' itemKey='asset' />
        </Tabs>
      </MoveablePanel>
    )
  }
}
