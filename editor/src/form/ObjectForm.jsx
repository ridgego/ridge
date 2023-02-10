import React from 'react'
import { Form, Button } from '@douyinfe/semi-ui'

import BorderEdit from './with-fields/BorderEdit.jsx'
import PopCodeEdit from './with-fields/PopCodeEdit.jsx'
import StateBindEdit from './with-fields/StateBindEdit.jsx'
import EventEdit from './with-fields/EventEdit.jsx'
import JSONEdit from './with-fields/JSONEdit.jsx'
import ImageEdit from './with-fields/ImageEdit.jsx'
import IconEdit from './with-fields/IconEdit.jsx'
import Px4Edit from './with-fields/Px4Edit.jsx'
import BackgroundEdit from './with-fields/BackgroundEdit.jsx'
import ColorPicker from './with-fields/ColorPicker.jsx'
import RadioGroupEdit from './with-fields/RadioGroupEdit.jsx'
import BoxShadowEdit from './with-fields/BoxShadowEdit.jsx'

import './form.less'

export default class ObjectForm extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()

    const {
      InputNumber,
      Select,
      Checkbox,
      Input
    } = Form

    this.controlGeneratorMap = {
      number: (col, readonly) => <InputNumber size='small' label={col.label} disabled={readonly} field={col.field} />,
      string: (col, readonly) => <Input size='small' label={col.label} field={col.field} disabled={readonly} />,
      text: (col, readonly) => <Input size='small' label={col.label} field={col.field} disabled={readonly} />,
      checkbox: (col, readonly) => <Checkbox size='small' label={col.label} field={col.field} disabled={readonly} />,
      boolean: (col, readonly) => <Checkbox size='small' label={col.label} field={col.field} disabled={readonly} />,
      select: (col, readonly) => {
        if (col.required) {
          return <Select size='small' label={col.label} field={col.field} optionList={col.optionList} disabled={readonly} />
        } else {
          return <Select placeholder='请选择' showClear size='small' label={col.label} field={col.field} optionList={col.optionList} disabled={readonly} />
        }
      },
      radiogroup: (col, readonly) => <RadioGroupEdit label={col.label} field={col.field} options={col.optionList} disabled={readonly} />,
      border: (col, readonly) => <BorderEdit label={col.label} field={col.field} disabled={readonly} />,
      boxshadow: (col, readonly) => <BoxShadowEdit label={col.label} field={col.field} disabled={readonly} />,
      event: (col, readonly, options) => <EventEdit className='event-field' labelPosition='top' label={col.label} field={col.field} options={options} />,
      image: (col, readonly) => <ImageEdit label={col.label} field={col.field} disabled={readonly} />,
      icon: (col, readonly) => <IconEdit label={col.label} field={col.field} disabled={readonly} />,
      px4: (col, readonly) => <Px4Edit label={col.label} field={col.field} disabled={readonly} />,
      background: (col, readonly) => <BackgroundEdit label={col.label} field={col.field} disabled={readonly} />,
      colorpicker: (col, readonly) => <ColorPicker label={col.label} field={col.field} disabled={readonly} />,
      json: (col, readonly) => <JSONEdit label={col.label} field={col.field} disabled={readonly} />
    }
  }

  getRenderField (col, readonly, options) {
    if (this.controlGeneratorMap[col.control]) {
      return this.controlGeneratorMap[col.control](col, readonly, options)
    } else {
      return <div>{col.label}类型不支持{col.control}</div>
    }
  }

  renderField (field, index, formState, options) {
    const hidden = (typeof field.hidden === 'function') ? field.hidden(formState.values) : field.hidden
    if (hidden) {
      return
    }
    const readonly = (typeof field.readonly === 'function') ? field.readonly(formState.values) : field.readonly
    if (field.control == null) {
      field.control = field.type || 'string'
    }
    const RenderField = this.getRenderField(field, readonly, options)
    RenderField.props.fieldStyle = {
      flex: 1
    }
    if (field.bindable === false) {
      return (
        <div style={{ width: field.width || '100%', marginBottom: '6px', display: 'flex' }}>
          {RenderField}
        </div>
      )
    } else {
      // 封装动态绑定的支持
      return (
        <div className='with-code-expr' style={{ width: field.width || '100%', marginBottom: '6px' }}>
          {RenderField}
          <StateBindEdit noLabel field={field.fieldEx} options={options} />
        </div>
      )
    }
  }

  renderCol (col) {
    const hidden = (typeof col.hidden === 'function') ? col.hidden(this.api.getValues()) : col.hidden

    if (hidden) {
      return
    }

    const {
      options
    } = this.props
    const readonly = (typeof col.readonly === 'function') ? col.readonly(this.api.getValues()) : col.readonly
    if (col.control == null) {
      col.control = col.type
    }
    const RenderField = this.getRenderField(col, readonly, options)
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
    const renderField = this.renderField.bind(this)
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
            <Section text={section.title}>
              {section.rows.map(renderRows)}
            </Section>}
          {!section.title && section.rows.map(renderRows)}
        </div>
      )
    }

    const { fields, sections, getFormApi, onValueChange, style, initValues, options, labelPosition = 'left' } = this.props

    const callback = (api) => {
      this.api = api
      getFormApi && getFormApi(api)
    }
    return (
      <div className='object-form' style={style}>
        <Form
          size='small'
          labelPosition={labelPosition}
          layout='horizontal'
          getFormApi={callback}
          initValues={initValues}
          onValueChange={onValueChange}
          render={({ formState, formApi, values }) => {
            return (
              <>
                {fields && fields.length}
                {fields && fields.map((field, index) => {
                  return renderField(field, index, formState, options)
                })}
                {sections && sections.map(renderSection)}
              </>
            )
          }}
        />
      </div>
    )
  }
}
