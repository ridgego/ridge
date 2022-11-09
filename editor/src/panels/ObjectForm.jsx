import React from 'react'
import { HexColorPicker } from 'react-colorful'
import { Form, Select, Row, Col, Space, withField, ArrayField, Button, useFieldState, InputNumber, Popover } from '@douyinfe/semi-ui'

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

const BorderEdit = withField((props) => {
  let sp = [0, 'solid', '#fff']
  if (props.value) {
    sp = props.value.split(' ')
    sp[0] = parseInt(sp[0])
  }
  return (
    <Space>
      <InputNumber
        style={{
          width: '64px'
        }}
        defaultValue={sp[0]}
        value={sp[0]} onChange={value => {
          props.onChange(value + 'px ' + sp[1] + ' ' + sp[2])
        }}
      /> <Select
        value={sp[1]} optionList={[{
          label: '实线',
          value: 'solid'
        }, {
          label: '点划线',
          value: 'dashed'
        }]}
        onChange={value => {
          props.onChange(sp[0] + 'px ' + value + ' ' + sp[2])
        }}
         />
      <Popover content={
        <HexColorPicker
          color={sp[2]} onChange={value => {
            props.onChange(sp[0] + 'px ' + sp[1] + ' ' + value)
          }}
        />
      }
      >
        <Button style={{
          backgroundColor: sp[2]
        }}
        />
      </Popover>
    </Space>
  )
})

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
    if (col.type === 'string' && !col.control) {
      col.control = 'text'
    }
    switch (col.control) {
      case 'number':
        return <InputNumber label={col.label} field={col.field} />
      case 'text':
        return <Input label={col.label} field={col.field} />
      case 'select':
        return <Select label={col.label} field={col.field} optionList={col.optionList} />
      case 'border':
        return <BorderEdit label={col.label} field={col.field} />
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
        <div key={i} className='object-section'>
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
