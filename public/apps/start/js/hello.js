export default {
  state: () => {
    return {
      name: ''
    }
  },
  getters: {
    hello: (state) => {
      return 'Hello ' + state.name
    }
  },
  actions: {
  },
  alias: {
    name: '姓名'
  }
}
