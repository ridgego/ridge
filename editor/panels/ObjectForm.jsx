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
      Input
    } = Form
    switch (col.control) {
      case 'number':
        return <InputNumber label={col.label} field={col.field} />
      case 'text':
        return <Input label={col.label} field={col.field} />
      default:
        break
    }
  }

  render () {
    const { renderCol } = this
    const { Section } = Form
    const { sections, getFormApi, onValueChange } = this.props
    return (
      <div className='object-form'>
        <Form
          labelPosition='left'
          getFormApi={getFormApi}
          onValueChange={onValueChange}
          style={{ padding: 10, width: '100%' }}
        >
          {sections.map((section, i) => {
            return (
              <Section key={i}>
                {section.rows.map((row, j) => {
                  return (
                    <Row key={j}>
                      <Space>
                        {row.cols.map((col, k) => {
                          return (
                            <Col key={k} span={24 / row.cols.length}>
                              {renderCol(col)}
                            </Col>
                          )
                        })}
                      </Space>
                    </Row>
                  )
                })}
              </Section>
            )
          })}
        </Form>
      </div>
    )
  }
}
