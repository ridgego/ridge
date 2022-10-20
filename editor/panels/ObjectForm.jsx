import React from 'react'
import { Form, Row, Col, Space } from '@douyinfe/semi-ui'

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
        return <Select label={col.label} field={col.field} optionList={col.options} />
      case 'css-style':
        return <TextArea label={col.label} field={col.field} />
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
        <>
          {section.title &&
            <Section key={i}>
              {section.rows.map(renderRows)}
            </Section>}
          {!section.title && section.rows.map(renderRows)}
        </>
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
