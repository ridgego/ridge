import React from 'react'
import { Form, Row, Col, Space, withField, ArrayField, Button, useFieldState } from '@douyinfe/semi-ui'

import BorderEdit from './with-fields/BorderEdit.jsx'
import PopCodeEdit from './with-fields/PopCodeEdit.jsx'
import EventEdit from './with-fields/EventEdit.jsx'

import './form.less'

const variableOptionList = withField((props) => {
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
      Checkbox,
      Input
    } = Form
    const {
      options
    } = this.props
    if (col.type === 'string' && !col.control) {
      col.control = 'text'
    }

    const readonly = col.readonly ? col.readonly(this.api.getValues()) : false
    const hidden = col.hidden ? col.hidden(this.api.getValues()) : false

    if (hidden) {
      return
    }
    let RenderField = null
    switch (col.control) {
      case 'number':
        RenderField = <InputNumber size='small' style={{ width: 85 }} label={col.label} disabled={readonly} field={col.field} />
        break
      case 'text':
        RenderField = <Input size='small' label={col.label} field={col.field} />
        break
      case 'checkbox':
        RenderField = <Checkbox size='small' label={col.label} field={col.field} />
        break
      case 'select':
        RenderField = <Select size='small' label={col.label} field={col.field} optionList={col.optionList} />
        break
      case 'border':
        RenderField = <BorderEdit label={col.label} field={col.field} />
        break
      case 'css-style':
        RenderField = <TextArea label={col.label} field={col.field} />
        break
      case 'event':
        RenderField = <EventEdit labelPosition='top' label={col.label} field={col.field} options={options} />
        break
      default:
        break
    }

    if (col.bindable === false) {
      return RenderField
    } else {
      // 封装动态绑定的支持
      return (
        <Space spacing={1} className='with-code-expr'>
          {RenderField}
          <PopCodeEdit noLabel fieldStyle={{ width: '36px' }} field={col.fieldEx} options={options} />
        </Space>
      )
    }
  }

  render () {
    const { Section } = Form
    const renderCol = this.renderCol.bind(this)
    const renderRows = (row, j) => {
      return (
        <Row key={j}>
          {row.cols.length > 1 &&
            <Space spacing={0}>
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

    const callback = (api) => {
      this.api = api
      getFormApi && getFormApi(api)
    }
    return (
      <div className='object-form' style={style}>
        <Form
          size='small'
          labelPosition='left'
          getFormApi={callback}
          onValueChange={onValueChange}
        >
          {sections.map(renderSection)}
        </Form>
      </div>
    )
  }
}
