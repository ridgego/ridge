import React from 'react'
import MoveablePanel from './MoveablePanel.jsx'
import { IconDelete, IconEdit } from '@douyinfe/semi-icons'
import { Table, Input, Select, TextArea, Tabs, TabPane, Button, InputNumber, Checkbox } from '@douyinfe/semi-ui'

import '../css/data-panel.less'

export default class DataPanel extends React.Component {
  constructor () {
    super()
    this.state = {
      show: true,
      variables: []
    }
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
      window.Ridge.emit('variableChange', this.state.variables)
      window.Ridge.getPageElementManager('editor-page').updateVariableConfig(this.state.variables)
    })
  }

  variableDelete (index) {
    this.state.variables.splice(index - 1, 1)
    this.setState({
      variables: this.state.variables
    }, () => {
      window.Ridge.getPageElementManager('editor-page').updateVariableConfig(this.state.variables)
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

    const renderEdit = (record, index) => {
      switch (record.type) {
        case 'number':
          return (
            <InputNumber
              defaultValue={record.value} onChange={value => {
                this.variableChange(index, 'value', value)
              }}
            />
          )
        case 'string':
          return (
            <Input
              size='small'
              addonAfter={<IconMaximize style={{ cursor: 'pointer' }} onClick={() => alert(0)} />}
              defaultValue={record.value} onChange={value => {
                this.variableChange(index, 'value', value)
              }}
            />
          )
        case 'boolean':
          return (
            <Checkbox
              defaultValue={record.value} onChange={value => {
                this.variableChange(index, 'value', value)
              }}
            />
          )
        case 'object':
          return (
            <TextArea
              defaultValue={record.value} onChange={value => {
                this.variableChange(index, 'value', value)
              }}
            />
          )
        default:
          break
      }
    }

    const addVariable = () => {
      this.setState({
        variables: this.state.variables.concat([{
          name: '变量' + (this.state.variables.length + 1),
          type: 'string',
          value: ''
        }])
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
