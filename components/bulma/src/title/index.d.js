import Title from './Title'
export default {
  name: 'title',
  title: '标题',
  component: Title,
  icon: 'bi bi-type-h1',
  order: 2,
  type: 'vanilla',
  props: [{
    name: 'text',
    label: '文本',
    bindable: true,
    type: 'string',
    value: '标题'
  }, {
    name: 'isSub',
    label: '子标题',
    type: 'boolean',
    value: false
  }, {
    name: 'level',
    label: '级别',
    type: 'string',
    control: 'radiogroup',
    optionList: [{
      label: 'H1',
      value: 'is-1'
    }, {
      label: 'H2',
      value: 'is-2'
    }, {
      label: 'H3',
      value: 'is-3'
    }, {
      label: 'H4',
      value: 'is-4'
    }, {
      label: 'H5',
      value: 'is-5'
    }, {
      label: 'H6',
      value: 'is-6'
    }],
    value: 'is-3'
  }],
  events: [],
  width: 160,
  height: 40
}
