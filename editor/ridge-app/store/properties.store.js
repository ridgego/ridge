export default {
  state: ({ properties }) => {
    // 从页面配置属性中拿到properties字段作为初始值
    return {
      properties: Array.isArray(properties) ? properties : []
    }
  },
  computed: {
    propName: {
      get: ({ item }) => {
        return item.name
      },
      set: (value, { item }) => {
        item.name = value
      }
    },
    propValue: {
      get: ({ item }) => {
        return item.value
      },
      set: (value, { item }) => {
        item.value = value
      }
    }
  },

  watch: {
    properties: function (oldValue, newValue) {
      this.emit('input', newValue)
    }
  },
  actions: {
    create () {
      this.state.properties.push({
        name: '',
        value: ''
      })
    },

    remove ({ i }) {
      this.state.properties.splice(i, 1)
    }
  }

}
