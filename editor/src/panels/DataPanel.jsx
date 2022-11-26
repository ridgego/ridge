import React from 'react'
import MoveablePanel from './MoveablePanel.jsx'
import { Table, Input, Select, TextArea, Tabs, TabPane, Button, InputNumber, Checkbox } from '@douyinfe/semi-ui'

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
      window.Ridge.getPageElementManager('editor-page').updateVariableConfig(this.state.variables)
    })
  }

  render () {
    const { panelClose, title, visible } = this.props
    const columns = [
      {
        title: '变量名',
        dataIndex: 'name',
        fixed: true,
        width: 120,
        render: (text, record, index) => {
          return (
            <div>
              <Input
                noLabel defaultValue={text} onChange={value => {
                  this.variableChange(index, 'name', value)
                }}
              />
            </div>
          )
        }
      },
      {
        title: '类型',
        dataIndex: 'type',
        width: 96,
        render: (text, record, index) => {
          return (
            <div>
              <Select
                noLabel
                onChange={value => {
                  this.variableChange(index, 'type', value)
                }}
                value={text}
              >
                <Select.Option value='number'>数字</Select.Option>
                <Select.Option value='string'>字符</Select.Option>
                <Select.Option value='boolean'>布尔</Select.Option>
                <Select.Option value='object'>对象</Select.Option>
                <Select.Option value='array'>列表</Select.Option>
              </Select>
            </div>
          )
        }
      },
      {
        title: '取值',
        dataIndex: 'value',
        render: (text, record, index) => {
          return (
            <div>
              {renderEdit(record, index)}
            </div>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        width: 96,
        render: (text, record, index) => {
          return (
            <div>
              删除
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
          name: 'var',
          type: 'string',
          value: ''
        }])
      })
    }
    return (
      <MoveablePanel right='10px' bottom='10px' width='420px' height='360px' {...this.props}>
        <Tabs
          type='card'
        >
          <TabPane tab='页面变量' itemKey='var'>
            <Button
              size='small' type='primary' style={{ marginBottom: 8 }} onClick={addVariable}
            >增加变量
            </Button>
            <Table bordered scroll={{ y: 220 }} columns={columns} pagination={false} dataSource={this.state.variables} />
          </TabPane>
          <TabPane tab='数据' itemKey='data' />
          <TabPane tab='资源' itemKey='asset' />
        </Tabs>
      </MoveablePanel>
    )
  }
}
