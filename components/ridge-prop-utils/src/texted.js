export default {
  style: (props) => {
    const style = {
      color: props.color,
      fontSize: props.fontSize + 'px',
      lineHeight: props.lineHeight + 'px',
      fontWeight: props.fontWeight,
      fontFamilly: props.fontFamilly
    }
    return style
  },
  props: [{
    name: 'color',
    label: '颜色',
    type: 'string',
    width: '50%',
    control: 'colorpicker',
    value: '#fff'
  }, {
    label: '字号',
    name: 'fontSize',
    party: true,
    width: '50%',
    type: 'number',
    value: 14
  }, {
    label: '行高',
    width: '50%',
    name: 'lineHeight',
    type: 'number',
    bindable: false,
    value: 14
  }, {
    label: '字体',
    width: '50%',
    name: 'fontFamilly',
    type: 'string',
    control: 'select',
    bindable: false,
    optionList: [{
      label: '宋体',
      value: 'SimSun'
    },
    {
      label: '黑体',
      value: 'SimHei'
    },
    {
      label: '微软雅黑',
      value: 'Microsoft YaHei'
    },
    {
      label: '微软正黑体',
      value: 'Microsoft JhengHei'
    },
    {
      label: '新宋体',
      value: 'NSimSun'
    },
    {
      label: '仿宋',
      value: 'FangSong'
    },
    {
      label: '楷体',
      value: 'KaiTi'
    }]
  }, {
    name: 'fontWeight',
    label: '粗细',
    type: 'string',
    control: 'radiogroup',
    bindable: false,
    optionList: [{
      label: '细',
      style: {
        fontWeight: 'lighter'
      },
      value: 'lighter'
    }, {
      label: '正常',
      style: {
        fontWeight: 'normal'
      },
      value: 'normal'
    }, {
      label: '加粗',
      style: {
        fontWeight: 'bold'
      },
      value: 'bold'
    }]
  }]
}
