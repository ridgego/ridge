export default {
  state: () => {
    return {
      // 新增待办内容
      todoText: '',
      // 待办列表
      todoList: [],
      // 待办过滤条件
      filter: 'all'
    }
  },
  computed: {
    todoItemText: {
      get() {
        
      },
      set() {
        
      }
    }
  },
  getters: {
    // 列表项文本
    todoItemText: (state) => {
      return todoItem => todoItem.todoText
    },
    todoItemSeq: (state) => {
      return todoItem => state.filteredList.indexOf(todoItem) + 1
    },
    todoItemFinished: (state) => {
      return todoItem => todoItem.finished > 0
    },
    // 列表按条件显示
    filteredList: (state) => {
      return state.todoList.filter(t => {
        if (state.filter === 'todo') {
          return t.finished === -1
        } else if (state.filter === 'finished') {
          return t.finished > 0
        } else {
          return true
        }
      })
    },
    totalTodoCount: (state) => {
      return state.todoList.length
    }
  },
  actions: {
    // 增加待办
    addTodo () {
      this.todoList.push({
        todoText: this.todoText,
        finished: -1,
        created: new Date().getTime()
      })
      this.todoText = ''
    },
    removeTodo(todoItem) {
      this.$patch({
        todoList: this.todoList.filter(t => t.created!== todoItem.created)
      })
    },
    // 设置过滤项
    setFilter (filter) {
      this.filter = filter
    },
    finishTodo (todoItem) {
      todoItem.finished = new Date().getTime()
    }
  },
  alias: {
    "filter": "过滤条件",
    "totalTodoCount": "总计条目",
    "todoText": "新增待办输入",
    "setFilterTodo": "设置为待办",
    "todoItemText": "待办项文本",
    "todoItemSeq": "待办项序号",
    "todoList": "待办列表",
    "filteredList": "按条件的待办列表",
    "addTodo": "增加待办",
    "removeTodo": "删除待办项",
    "finishTodo": "完成待办"
  }
}