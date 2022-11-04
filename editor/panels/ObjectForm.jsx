import React from 'react'
import { Form, Row, Col, Space, withField, ArrayField, Button, useFieldState } from '@douyinfe/semi-ui'

const VariableListEdit = withField((props) => {
  const value = props.value
  const fieldState = useFieldState(props.id)
  const onValueChange = (values, changed) => {
    props.onChange(values)
  }
  return (
    <ArrayField noLabel field={props.id} initValue={value} onValueChange={onValueChange}>
      {({ add, arrayFields, addWithInitValue, ...args }) => (
        <>
          <Button onClick={() => addWithInitValue({
            name: '',
            type: 'string'
          })}
          >添加
          </Button>
          {arrayFields.map(({ field, key, remove }, i) => {
            return (
              <div key={key} style={{ width: 300, display: 'flex' }}>
                <Form.Input
                  noLabel
                  style={{ width: '115px' }}
                  field={`${field}[name]`}
                />
                <Form.Select
                  noLabel
                  style={{ margin: '0 4px' }}
                  field={`${field}[type]`}
                >
                  <Form.Select.Option value='number'>数字</Form.Select.Option>
                  <Form.Select.Option value='string'>字符</Form.Select.Option>
                  <Form.Select.Option value='boolean'>布尔</Form.Select.Option>
                  <Form.Select.Option value='object'>对象</Form.Select.Option>
                  <Form.Select.Option value='array'>列表</Form.Select.Option>
                </Form.Select>
                {fieldState.value && fieldState.value[i] && fieldState.value[i].type}
              </div>

            )
          })}
        </>
      )}
    </ArrayField>
  )
}, { })

export default class ObjectForm extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
  }

  renderCol (col) {
    const {
      InputNumber,
      TextArea,
      Select,
      Input
    } = Form
    switch (col.control) {
      case 'number':
        return <InputNumber label={col.label} field={col.field} />
      case 'text':
        return <Input label={col.label} field={col.field} />
      case 'select':
        return <Select label={col.label} field={col.field} optionList={col.optionList} />
      case 'css-style':
        return <TextArea label={col.label} field={col.field} />
      case 'variable':
        return <VariableListEdit noLabel field={col.field} />
      default:
        break
    }
  }

  render () {
    const { Section } = Form
    const renderCol = this.renderCol.bind(this)
    const renderRows = (row, j) => {
      return (
        <Row key={j}>
          {row.cols.length > 1 &&
            <Space>
              {row.cols.map((col, k) => {
                return (
                  <Col key={k} span={24 / row.cols.length}>
                    {renderCol(col)}
                  </Col>
                )
              })}
            </Space>}
          {row.cols.length === 1 &&
            <Col span={24}>
              {renderCol(row.cols[0])}
            </Col>}
        </Row>
      )
    }
    const renderSection = (section, i) => {
      return (
        <div key={i}>
          {section.title &&
            <Section>
              {section.rows.map(renderRows)}
            </Section>}
          {!section.title && section.rows.map(renderRows)}
        </div>
      )
    }

    const { sections, getFormApi, onValueChange, style } = this.props
    return (
      <div className='object-form' style={style}>
        <Form
          labelPosition='left'
          getFormApi={getFormApi}
          onValueChange={onValueChange}
          style={{ padding: 10, width: '100%' }}
        >
          {sections.map(renderSection)}
        </Form>
      </div>
    )
  }
}
