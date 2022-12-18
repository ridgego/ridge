import React from 'react'
import { Form } from '@douyinfe/semi-ui'

import BorderEdit from './with-fields/BorderEdit.jsx'
import PopCodeEdit from './with-fields/PopCodeEdit.jsx'
import EventEdit from './with-fields/EventEdit.jsx'
import JSONEdit from './with-fields/JSONEdit.jsx'

import './form.less'

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
    const readonly = col.readonly ? col.readonly(this.api.getValues()) : false
    const hidden = col.hidden ? col.hidden(this.api.getValues()) : false

    if (hidden) {
      return
    }
    if (col.control == null) {
      col.control = col.type
    }
    let RenderField = null
    switch (col.control) {
      case 'number':
        RenderField = <InputNumber size='small' label={col.label} disabled={readonly} field={col.field} />
        break
      case 'text':
      case 'string':
        RenderField = <Input size='small' label={col.label} field={col.field} />
        break
      case 'boolean':
      case 'checkbox':
        RenderField = <Checkbox size='small' label={col.label} field={col.field} />
        break
      case 'select':
        if (col.required) {
          RenderField = <Select size='small' label={col.label} field={col.field} optionList={col.optionList} />
        } else {
          RenderField = <Select placeholder='请选择' showClear size='small' label={col.label} field={col.field} optionList={col.optionList} />
        }
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
      case 'json-editor':
        RenderField = <JSONEdit label={col.label} field={col.field} />
        break
      default:
        break
    }

    if (col.bindable === false) {
      return RenderField
    } else {
      // 封装动态绑定的支持
      return (
        <div className='with-code-expr'>
          {RenderField}
          <PopCodeEdit noLabel fieldStyle={{ width: '36px' }} field={col.fieldEx} options={options} />
        </div>
      )
    }
  }

  render () {
    const { Section } = Form
    const renderCol = this.renderCol.bind(this)
    const renderRows = (row, j) => {
      return (
        <div className='row' key={j}>
          {row.cols.length > 1 &&
            <>
              {row.cols.map((col, k) => {
                return (
                  <div key={k} className={'col-' + (24 / row.cols.length)}>
                    {renderCol(col)}
                  </div>
                )
              })}
            </>}
          {row.cols.length === 1 && renderCol(row.cols[0])}
        </div>
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
