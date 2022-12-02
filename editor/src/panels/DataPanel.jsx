import React from 'react'
import MoveablePanel from './MoveablePanel.jsx'
import { IconDelete, IconEdit } from '@douyinfe/semi-icons'
import { Table, Input, Select, TextArea, Tabs, TabPane, Button, InputNumber, Checkbox } from '@douyinfe/semi-ui'

import '../css/data-panel.less'
import { EVENT_PAGE_LOADED, EVENT_PAGE_VAR_CHANGE } from '../constant.js'

export default class DataPanel extends React.Component {
  constructor () {
    super()
    this.state = {
      show: true,
      variables: []
    }

    window.Ridge.on(EVENT_PAGE_LOADED, ({
      pageVariables
    }) => {
      this.setState({
        variables: pageVariables
      })
    })
  }

  loadVariables (variables) {
    this.setState({
      variables
    })
  }

  variableChange (index, key, value) {
    this.setState({
      variables: this.state.variables.map((variable, i) => {
        if (i === index) {
          return { ...variable, [key]: value }
        } else {
          return variable
        }
      })
    }, () => {
      window.Ridge.emit(EVENT_PAGE_VAR_CHANGE, this.state.variables)
    })
  }

  variableDelete (index) {
    this.state.variables.splice(index - 1, 1)
    this.setState({
      variables: this.state.variables
    }, () => {
      window.Ridge.emit(EVENT_PAGE_VAR_CHANGE, this.state.variables)
    })
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
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        fixed: true,
        width: 120,
        render: (text, record, index) => {
          return (
            <div>
              <Input
                size='small'
                defaultValue={text} onChange={value => {
                  this.variableChange(index, 'name', value)
                }}
              />
            </div>
          )
        }
      },
      {
        title: '取值',
        dataIndex: 'value',
        render: (text, record, index) => {
          return (
            <div className='variable-value'>
              <Input
                size='small'
                value={record.value} onChange={value => {
                  this.variableChange(index, 'value', value)
                }}
              />
              <IconEdit className='action-edit' style={{ cursor: 'pointer' }} onClick={() => this.openEditCode(record.value, index)} />
              <IconDelete className='action-delete' onClick={() => this.variableDelete(index)} />
            </div>
          )
        }
      }
    ]

    const addVariable = () => {
      this.setState({
        variables: this.state.variables.concat([{
          name: '变量' + (this.state.variables.length + 1),
          type: 'string',
          value: ''
        }], () => {
          window.Ridge.emit(EVENT_PAGE_VAR_CHANGE, this.state.variables)
        })
      })
    }
    return (
      <MoveablePanel right='10px' bottom='10px' width='300px' height='240px' {...this.props}>
        <Tabs
          type='card'
          size='small'
        >
          <TabPane size='small' tab='页面变量' itemKey='var'>
            <Table bordered columns={columns} pagination={false} dataSource={this.state.variables} />
            <Button
              size='small' type='primary' style={{ marginBottom: 8 }} onClick={addVariable}
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
