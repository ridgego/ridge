import React from 'react'
import { Form, Button, Table, Divider } from '@douyinfe/semi-ui'
import { IconStopwatchStroked } from '@douyinfe/semi-icons'

import BorderEdit from './with-fields/BorderEdit.jsx'
import StateBindEdit from './with-fields/StateBindEdit.jsx'
import EventEdit from './with-fields/EventEdit.jsx'
import JSONEdit from './with-fields/JSONEdit.jsx'
import ImageEdit from './with-fields/ImageEdit.jsx'
import IconEdit from './with-fields/IconEdit.jsx'
import PaddingEdit from './with-fields/PaddingEdit.jsx'
import BackgroundEdit from './with-fields/BackgroundEdit.jsx'
import ColorPicker from './with-fields/ColorPicker.jsx'
import PresetColorPicker from './with-fields/PresetColorPicker.jsx'
import RadioGroupEdit from './with-fields/RadioGroupEdit.jsx'
import CheckBoxGroupEdit from './with-fields/CheckBoxGroupEdit.jsx'
import ToggleIcon from './with-fields/ToggleIcon.jsx'
import FontEdit from './with-fields/FontEdit.jsx'
import ArrayEdit from './with-fields/ArrayEdit.jsx'
import SeriesTableEdit from './with-fields/SeriesTableEdit.jsx'
import './form.less'
import ClassEdit from './with-fields/ClassEdit.jsx'
import AudioEdit from './with-fields/AudioEdit.jsx'
import FontFamilyEdit from './with-fields/FontFamilyEdit.jsx'
import BooleanEdit from './with-fields/BooleanEdit.jsx'
import PropertiesEdit from './with-fields/PropertiesEdit.jsx'
import FieldTreeSelect from './with-fields/TreeSelect.jsx'
import ClassSelect from './with-fields/ClassSelect.jsx'

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
      number: (col, readonly) => <InputNumber size='small' label={col.label} disabled={readonly} innerButtons field={col.field} />,
      length: (col, readonly) => <InputNumber size='small' label={col.label} disabled={readonly} field={col.field} />,
      string: (col, readonly) => <Input size='small' label={col.label} field={col.field} disabled={readonly} />,
      text: (col, readonly) => <Input size='small' label={col.label} field={col.field} disabled={readonly} />,
      checkbox: (col, readonly) => <Checkbox size='small' label={col.label} field={col.field} disabled={readonly} />,
      boolean: (col, readonly) => <BooleanEdit noLabel={col.label == null} label={col.label} {...col} />,
      select: (col, readonly) => {
        return <Select size='small' label={col.label} showClear={col.required === false} field={col.field} placeholder={col.placeholder} multiple={col.multiple} optionList={col.options || col.optionList} disabled={readonly} />
      },
      radiogroup: (col, readonly) => <RadioGroupEdit label={col.label} field={col.field} options={col.optionList || col.options} disabled={readonly} />,
      checkboxgroup: (col, readonly) => <CheckBoxGroupEdit label={col.label} field={col.field} optionList={col.optionList} selectAll={col.selectAll} disabled={readonly} />,
      // states: (col, readonly) => <StateListEdit label={col.label} field={col.field} {...col} />,
      fontFamily: (col, readonly) => <FontFamilyEdit label={col.label} field={col.field} disabled={readonly} />,
      border: (col, readonly) => <BorderEdit label={col.label} field={col.field} disabled={readonly} />,
      padding: (col, readonly) => <PaddingEdit disabled={readonly} {...col} />,
      // boxshadow: (col, readonly) => <BoxShadowEdit label={col.label} field={col.field} disabled={readonly} />,
      event: (col, readonly, options) => <EventEdit className='event-field' noLabel field={col.field} options={{ label: col.label, ...options }} />,
      image: (col, readonly) => <ImageEdit label={col.label} field={col.field} disabled={readonly} options={col} />,
      page: (col, readonly) => <ImageEdit label={col.label} field={col.field} disabled={readonly} options={col} />,
      // icon: (col, readonly) => <IconEdit label={col.label} field={col.field} disabled={readonly} />,
      audio: (col, readonly) => <AudioEdit label={col.label} field={col.field} disabled={readonly} />,
      // rect: (col, readonly) => <RectEdit label={col.label} field={col.field} noLabel disabled={readonly} />,
      font: (col, readonly) => <FontEdit label={col.label} field={col.field} disabled={readonly} />,
      background: (col, readonly) => <BackgroundEdit label={col.label} field={col.field} disabled={readonly} />,
      colorpicker: (col, readonly) => <ColorPicker noLabel label={col.label ?? ''} field={col.field} options={col.presetColors} disabled={readonly} />,
      color: (col, readonly) => <ColorPicker noLabel={col.label == null} label={col.label ?? ''} field={col.field} options={col.presetColors} disabled={readonly} />,
      // presetcolorpicker: (col, readonly) => <PresetColorPicker label={col.label} field={col.field} options={col.presetColors} disabled={readonly} />,
      json: (col, readonly) => <JSONEdit label={col.label} field={col.field} disabled={readonly} />,
      array: (col) => <ArrayEdit label={col.label} field={col.field} options={col} />,
      class: (col) => <ClassEdit label={col.label} field={col.field} options={col} />,
      properties: col => <PropertiesEdit noLabel field={col.field} page='hi1' />,
      tree: col => <FieldTreeSelect label={col.label} field={col.field} options={col} />,
      style: col => <ClassSelect label={col.label} field={col.field} options={col} />,
      SeriesData: (col) => <SeriesTableEdit {...col} />
    }
  }

  getRenderField (field, readonly, options) {
    if (this.controlGeneratorMap[field.control]) {
      return this.controlGeneratorMap[field.control](field, readonly, options)
    } else {
      return <div>{field.label}类型不支持{field.control}</div>
    }
  }

  renderField (field, index, formState, options) {
    if (field.type === 'slot' || field.type === 'children') {
      return
    }
    const hidden = (typeof field.hidden === 'function') ? field.hidden(formState.values) : field.hidden
    if (hidden) {
      return
    }
    const readonly = (typeof field.readonly === 'function') ? field.readonly(formState.values) : field.readonly
    if (field.control == null) {
      field.control = field.type
    }
    const RenderField = this.getRenderField(field, readonly, options)
    // if (field.label) {
    //   RenderField.props.label = field.label
    // } else {
    //   RenderField.props.noLabel = true
    // }
    if (field.type === 'divider') {
      return <Divider key={index} margin='0' align='left'>{field.label || ''}</Divider>
    } else if (field.fieldEx) {
      // 封装动态绑定的支持
      return (
        <div key={index} className={'field-block with-code-expr ' + (field.width ? '' : 'full-width')} style={{ width: field.width || '100%' }}>
          <div style={{ flex: 1 }}>
            {RenderField}
          </div>
          <StateBindEdit className='field-code-expr' noLabel field={field.fieldEx} options={options} />
        </div>
      )
    } else {
      return (
        <div key={index} className='field-block' style={{ width: field.width || '100%' }}>
          {RenderField}
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
          labelAlign='right'
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
