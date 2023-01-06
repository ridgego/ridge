import React from 'react'
import { Form, Button } from '@douyinfe/semi-ui'

import BorderEdit from './with-fields/BorderEdit.jsx'
import PopCodeEdit from './with-fields/PopCodeEdit.jsx'
import EventEdit from './with-fields/EventEdit.jsx'
import JSONEdit from './with-fields/JSONEdit.jsx'
import ImageEdit from './with-fields/ImageEdit.jsx'

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
      Input,
      Upload
    } = Form
    const {
      options
    } = this.props
    const readonly = (typeof col.readonly === 'function') ? col.readonly(this.api.getValues()) : col.readonly
    const hidden = (typeof col.hidden === 'function') ? col.hidden(this.api.getValues()) : col.hidden

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
        RenderField = <Input size='small' label={col.label} field={col.field} disabled={readonly} />
        break
      case 'boolean':
      case 'checkbox':
        RenderField = <Checkbox size='small' label={col.label} field={col.field} disabled={readonly} />
        break
      case 'select':
        if (col.required) {
          RenderField = <Select size='small' label={col.label} field={col.field} optionList={col.optionList} disabled={readonly} />
        } else {
          RenderField = <Select placeholder='请选择' showClear size='small' label={col.label} field={col.field} optionList={col.optionList} disabled={readonly} />
        }
        break
      case 'border':
        RenderField = <BorderEdit label={col.label} field={col.field} disabled={readonly} />
        break
      case 'css-style':
        RenderField = <TextArea label={col.label} field={col.field} disabled={readonly} />
        break
      case 'event':
        RenderField = <EventEdit labelPosition='top' label={col.label} field={col.field} options={options} />
        break
      case 'json-editor':
        RenderField = <JSONEdit label={col.label} field={col.field} disabled={readonly} />
        break
      case 'file':
        RenderField = <Upload label={col.label} field={col.field} disabled={readonly} />
        break
      case 'image':
        RenderField = <ImageEdit label={col.label} field={col.field} disabled={readonly} />
        break
      case 'button':
        RenderField = <Button label={col.label} />
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

    const { sections, getFormApi, onValueChange, style, initValues } = this.props

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
          initValues={initValues}
          onValueChange={onValueChange}
        >
          {sections.map(renderSection)}
        </Form>
      </div>
    )
  }
}
