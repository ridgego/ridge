export default {
  state: () => {
    return {
      todoText: '',
      todoList: []
    }
  },

  computed: {
    finishedTodoList: state => {
      return state.todoList.filter(todo => todo.finished === 1)
    },

    activeTodoList: state => {
      return state.todoList.filter(todo => todo.finished === -1)
    },

    todoItemText: (state, scope) => {
      return scope?.item?.text
    }
  },

  setup () {
    if (window.localStorage.ridge_todo_sample_data) {
      this.state.todoList = JSON.parse(window.localStorage.ridge_todo_sample_data)
    }
  },

  exit () {},
  watch: {},

  actions: {
    addTodo () {
      this.state.todoList.push({
        text: this.state.todoText,
        finished: -1
      })
    },

    finishTodo (scope) {
      scope.item.finished = 1
    },

    activeTodo (scope) {
      scope.item.finished = -1
    }
  }
}
