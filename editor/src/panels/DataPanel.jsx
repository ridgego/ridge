import React from 'react'
import { Table, Input, Select, TextArea, Tabs, TabPane, Button } from '@douyinfe/semi-ui'

export default class VariablePanel extends React.Component {
  constructor () {
    super()
    this.state = {
      variables: []
    }
  }

  loadVariables (variables) {
    this.setState({
      variables
    })
  }

  variableChange (record, index) {
    this.setState({
      variables: this.state.variables
    })

    window.Ridge.getPageElementManager('editor-page').updateVariableConfig(this.state.variables)
  }

  render () {
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
                noLabel value={text} onChange={value => {
                  record.name = value
                  this.variableChange(record, index)
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
              <Input noLabel value={text} />
            </div>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'value',
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
      <div className='data-panel'>
        <Tabs
          type='card'
        >
          <TabPane tab='页面变量' itemKey='var'>
            <Button
              theme='solid' type='primary' style={{ margin: 8 }} onClick={addVariable}
            >增加变量
            </Button>
            <Table bordered scroll columns={columns} pagination={false} dataSource={this.state.variables} />
          </TabPane>
          <TabPane tab='数据' itemKey='data' />
        </Tabs>
      </div>
    )
  }
}
