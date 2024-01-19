export default {
  state: () => {
    return {
      todoText: '',
      todoInvalid: false,
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
  watch: {
    todoText (val) {
      if (val === '') {
        this.state.todoInvalid = true
      } else {
        this.state.todoInvalid = false
      }
    }
  },

  actions: {
    addTodo () {
      if (this.state.todoText !== '') {
        this.state.todoList.push({
          text: this.state.todoText,
          finished: -1
        })
      } else {
        this.state.todoInvalid = true
      }
    },

    finishTodo (scope) {
      scope.item.finished = 1
    },

    activeTodo (scope) {
      scope.item.finished = -1
    }
  }
}
