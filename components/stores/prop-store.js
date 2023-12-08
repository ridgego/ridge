export default {
  // 名称必须设置，在一个页面里必须唯一
  name: 'PropertiesStore',
  // 状态集合, 固定值可以直接返回对象。如果从配置（页面属性）初始化，可以为函数
  state: (config) => {
    return {
      editIndex: -1,
      properties: config ?? []
    }
  },

  // 从state计算的值
  computed: {
    editEnabled: state => {
      return state.editIndex > -1
    },
    propNameValid: (state) => {
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
    properties: function (oldValue, newValue) {
      this.emit('input', newValue)
    }
  },

  // 动作，可发起状态变化
  actions: {
    addProperty () {
      this.properties.push({
        name: 'name',
        value: 'value'
      })
      this.editIndex = this.properties.length - 1
    },

    editProperty (scope) {
      this.editIndex = scope.i
    },

    saveProperty () {
      this.editIndex = -1
    },

    remove (scope) {
      if (this.editIndex === scope.i) {
        this.editIndex = -1
      }
      this.properties.splice(scope.i, 1)
    }
  }
}
