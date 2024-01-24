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
      return state.todoList.filter(todo => todo.finished)
    },

    activeTodoList: state => {
      return state.todoList.filter(todo => !todo.finished)
    },
    // scoped computed value
    todoItemText: (state, scope) => {
      return scope?.item?.text
    },
    todoItemFinished: {
      set: (val, state, scope) => {
        scope.item.finished = val
      },
      get: (state, scope) => {
        return scope?.item?.finished
      }
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
      if (val !== '') {
        this.state.todoInvalid = false
      }
    }
  },

  actions: {
    addTodo () {
      if (this.state.todoText !== '') {
        this.state.todoList.push({
          text: this.state.todoText,
          finished: false
        })
        this.state.todoText = ''
      } else {
        this.state.todoInvalid = true
      }
    },
    removeTodo (context) {
      this.state.todoList = this.state.todoList.filter(todo => todo !== context.scope.item)
    }
  }
}
