export default {
  name: "hello",
  state: () => {
    return {
      name: ""
    }
  },
  getters: {
    hello: (state) => {
      return 'Hello ' + state.name
    }
  },
  actions: {
  }
}