export default {
  // 名称必须设置，在一个页面里必须唯一
  name: 'PropertiesStore',
  // 状态集合, 固定值可以直接返回对象。如果从配置（页面属性）初始化，可以为函数
  state: (properties, state) => {
    const stateObject = {
      editIndex: -1,
      properties: [],
      ...state
    }

    if (properties && Array.isArray(properties.value)) {
      stateObject.properties = properties.value
    }
    return stateObject
  },

  // 从state计算的值
  computed: {
    editEnabled: state => {
      return state.editIndex > -1
    },
    propNameValid: state => {
      return state.properties.length
    }
  },

  // 作用域值， 一般在列表中使用
  scoped: {
    // 本行编辑/只读
    itemSwitchIndex: (state, scope) => {
      return state.editIndex === scope.i ? 1 : 0
    },
    propName: {
      get: (state, scope) => {
        return scope.item?.name
      },
      set: (value, scope, state) => {
        state.properties[scope.i].name = value
      }
    },
    propValue: {
      get: (state, scope) => {
        return scope.item?.value
      },
      set: (value, scope, state) => {
        state.properties[scope.i].value = value
      }
    }
  },

  // 监听值改变
  watch: {
    properties: function (value, context) {
      context.composite.emit('input', value)
    }
  },

  // 动作，可发起状态变化
  actions: {
    addProperty: (event, context) => {
      const { state } = context
      state.properties.push({
        name: 'name',
        value: 'value'
      })
      state.editIndex = state.properties.length - 1
    },

    editProperty: (event, context) => {
      const { scope, state } = context
      if (scope) {
        state.editIndex = scope.i
      }
    },

    saveProperty: (event, context) => {
      const { state } = context
      state.editIndex = -1
    },

    remove: (event, context) => {
      const { state, scope } = context
      if (state.editIndex === scope.i) {
        state.editIndex = -1
      }
      state.properties.splice(scope.i, 1)
    }
  }
}
