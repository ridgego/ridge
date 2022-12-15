export const EVENT_PAGE_LOADED = 'pageLoaded'
export const EVENT_PAGE_VAR_CHANGE = 'pageVariableChange'
export const EVENT_PAGE_PROP_CHANGE = 'pagePropChange'
export const EVENT_PAGE_EVENT_CHANGE = 'pageEventChange'

export const EVENT_ELEMENT_SELECTED = 'elementSelected'
export const EVENT_ELEMENT_PROP_CHANGE = 'componentPropChange'
export const EVENT_ELEMENT_EVENT_CHANGE = 'componentEventChange'
export const EVENT_ELEMENT_CREATED = 'elementCreated'
export const EVENT_ELEMENT_REMOVED = 'elementRemoved'
export const EVENT_ELEMENT_PARENT_CHANGE = 'elementParentChanged'

export const FORM_PAGE_PROPS = [{
  rows: [{
    cols: [{
      label: '页面名称',
      control: 'text',
      bindable: false,
      field: 'title'
    }]
  }, {
    cols: [{
      label: '页面布局',
      control: 'select',
      field: 'type',
      bindable: false,
      optionList: [{
        label: '固定宽高',
        value: 'fixed'
      }, {
        label: '宽度自适应',
        value: 'fit-w'
      }, {
        label: '宽高自适应',
        value: 'fit-wh'
      }]
    }]
  }, {
    cols: [{
      label: 'W',
      when: 'type === "fixed"',
      bindable: false,
      control: 'number',
      field: 'width'
    }, {
      label: 'H',
      when: 'type === "fixed"',
      bindable: false,
      control: 'number',
      field: 'height'
    }]
  }]
}]

export const FORM_COMPONENT_BASIC = [{
  rows: [
    {
      cols: [{
        label: '名称',
        control: 'text',
        bindable: false,
        field: 'name'
      }]
    },
    {
      cols: [{
        label: 'X',
        control: 'number',
        readonly: (values) => {
          return !(values && values.style && values.style.position === 'absolute')
        },
        field: 'style.x',
        fieldEx: 'styleEx.x'
      }, {
        label: 'Y',
        control: 'number',
        readonly: (values) => {
          return !(values && values.style && values.style.position === 'absolute')
        },
        field: 'style.y',
        fieldEx: 'styleEx.Y'
      }]
    },
    {
      cols: [{
        label: 'W',
        control: 'number',
        field: 'style.width',
        fieldEx: 'styleEx.width'
      }, {
        label: 'H',
        control: 'number',
        field: 'style.height',
        fieldEx: 'styleEx.height'
      }]
    },
    {
      cols: [{
        label: '显示',
        type: 'boolean',
        control: 'checkbox',
        field: 'style.visible',
        fieldEx: 'styleEx.visible'
      }]
    }
  ]
}]
