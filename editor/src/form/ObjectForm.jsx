import React from 'react'
import { Form, Button, Table, Divider } from '@douyinfe/semi-ui'
import { IconStopwatchStroked } from '@douyinfe/semi-icons'

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
import ToggleIcon from './with-fields/ToggleIcon.jsx'

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
      divider: (col) => <Divider margin='0' align='center'>{col.label}</Divider>,
      number: (col, readonly) => <InputNumber labelPosition='inset' size='small' label={col.label} disabled={readonly} field={col.field} />,
      string: (col, readonly) => <Input size='small' label={col.label} field={col.field} disabled={readonly} />,
      text: (col, readonly) => <Input size='small' label={col.label} field={col.field} disabled={readonly} />,
      checkbox: (col, readonly) => <Checkbox size='small' label={col.label} field={col.field} disabled={readonly} />,
      boolean: (col, readonly) => <Checkbox size='small' label={col.label} field={col.field} disabled={readonly} />,
      select: (col, readonly) => {
        if (col.required === false) {
          return <Select placeholder='请选择' showClear size='small' label={col.label} field={col.field} optionList={col.optionList} disabled={readonly} />
        } else {
          return <Select size='small' label={col.label} field={col.field} optionList={col.optionList} disabled={readonly} />
        }
      },
      radiogroup: (col, readonly) => <RadioGroupEdit label={col.label} field={col.field} options={col.optionList} disabled={readonly} />,
      border: (col, readonly) => <BorderEdit label={col.label} field={col.field} disabled={readonly} />,
      boxshadow: (col, readonly) => <BoxShadowEdit label={col.label} field={col.field} disabled={readonly} />,
      event: (col, readonly, options) => <EventEdit className='event-field' labelPosition='top' noLabel field={col.field} options={{ label: col.label, ...options }} />,
      image: (col, readonly) => <ImageEdit label={col.label} field={col.field} disabled={readonly} />,
      icon: (col, readonly) => <IconEdit label={col.label} field={col.field} disabled={readonly} />,
      px4: (col, readonly) => <Px4Edit label={col.label} field={col.field} disabled={readonly} />,
      background: (col, readonly) => <BackgroundEdit label={col.label} field={col.field} disabled={readonly} />,
      colorpicker: (col, readonly) => <ColorPicker label={col.label} field={col.field} disabled={readonly} />,
      json: (col, readonly) => <JSONEdit label={col.label} field={col.field} disabled={readonly} />
    }
  }

  getRenderField (field, readonly, options) {
    if (!field.control) {
      field.control = field.type || 'string'
    }
    if (this.controlGeneratorMap[field.control]) {
      return this.controlGeneratorMap[field.control](field, readonly, options)
    } else {
      return <div>{field.label}类型不支持{field.control}</div>
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
    if (field.type === 'divider') {
      return <Divider margin='0' align='center'>{field.label || ''}</Divider>
    } else if (field.bindable === false) {
      return (
        <div className='field-block' style={{ width: field.width || '100%' }}>
          {RenderField}
        </div>
      )
    } else {
      // 封装动态绑定的支持
      return (
        <div className='field-block with-code-expr' style={{ width: field.width || '100%' }}>
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
    const renderField = this.renderField.bind(this)

    const { fields, tableStyle, getFormApi, onValueChange, style, initValues, options, labelPosition = 'left' } = this.props

    const renderFormTable = (formState) => {
      const columns = [
        {
          dataIndex: 'label',
          width: 68
        },
        {
          dataIndex: 'bind',
          render: (text, record, index) => {
            const readonly = (typeof record.readonly === 'function') ? record.readonly(formState.values) : record.readonly
            const field = this.getRenderField(record, readonly, options)
            field.props.noLabel = true
            return field
          }
        }, {
          dataIndex: 'bind',
          width: 32,
          render: (text, record, index) => {
            if (record.extra === 'debug') {
              return <ToggleIcon noLabel field='debug' icon={<IconStopwatchStroked />} />
            } else if (record.bindable === false) {
              return null
            } else {
              return <StateBindEdit noLabel field={record.fieldEx} options={options} />
            }
          }
        }]
      return (
        <Table
          columns={columns}
          dataSource={fields}
          pagination={false}
        />
      )
    }
    const callback = (api) => {
      this.api = api
      getFormApi && getFormApi(api)
    }
    return (
      <div className='object-form' style={style}>
        {!tableStyle && <Form
          size='small'
          labelPosition={labelPosition}
          layout='horizontal'
          getFormApi={callback}
          initValues={initValues}
          onValueChange={onValueChange}
          render={({ formState, formApi, values }) => {
            return (
              <>
                {fields && fields.map((field, index) => {
                  return renderField(field, index, formState, options)
                })}
                {/* {sections && sections.map(renderSection)} */}
              </>
            )
          }}
                        />}
        {tableStyle &&
          <Form
            noLabel
            labelPosition={labelPosition}
            getFormApi={callback}
            initValues={initValues}
            onValueChange={onValueChange}
            render={({ formState, formApi, values }) => {
              return (
                <>
                  {fields && renderFormTable(formState, values)}
                  {/* {sections && sections.map(renderSection)} */}
                </>
              )
            }}
          />}
      </div>
    )
  }
}
