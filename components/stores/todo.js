export default {
  state: () => {
    return {
      todoText: '',
      // 待办列表
      todoList: [],
      // 待办过滤条件
      filter: 'all'
    }
  },
  getters: {
    // 列表项文本
    todoItemText: () => {
      return i => this.todoList[i].todoText
    },
    // 列表按条件显示
    filteredList: () => {
      return this.todoList.filter(t => {
        if (this.filter === 'todo') {
          return t.finished === -1
        } else if (this.filter === 'fininshed') {
          return t.finished > 0
        } else {
          return true
        }
      })
    }
  },
  actions: {
    // 增加待办
    addTodo () {
      this.todoList.push({
        todoText: this.todoText,
        finished: false,
        created: new Date().getTime()
      })
      this.todoText = ''
    },
    // 设置过滤项
    setFilter (filter) {
      this.filter = filter
    },
    setFilterTodo () {
      this.filter = 'todo'
    }
  },
  alias: {
    todoText: '新增待办内容'
  }
}
