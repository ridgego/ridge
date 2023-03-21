export default {
  state: {
    todoText: '',
    todoList: [],
    allTodoCount: (ctx) => ('共' + ctx.todoList.length + '条待办事项'),
    filter: 'all',
    todoItemText: (ctx) => ctx.$item.todoText,
    itemFinished: (state) => {
      return state.$item.finished > -1
    },
    todoMouseHover: (ctx) => ctx.$hover,
    listItemBackground: (ctx) => {
      if (ctx.$item.finished > -1) {
        return 'rgba(74, 206, 163, 0.1)'
      } else if (ctx.$hover) {
        return 'rgba(74, 206, 163, 0.05)'
      } else {
        return ''
      }
    },
    tabBgAll: ctx => {
      if (ctx.filter === 'all') {
        return '#7996a5'
      } else {
        return '#fff'
      }
    },
    tabBgTextColor: ctx => {
      if (ctx.filter === 'all') {
        return '#fff'
      } else {
        return '#8a9ca5'
      }
    },
    tabFinshedBgColor: ctx => {
      if (ctx.filter === 'finished') {
        return '#7996a5'
      } else {
        return '#fff'
      }
    },
    tabFinishedTextColor: ctx => {
      if (ctx.filter === 'finished') {
        return '#fff'
      } else {
        return '#8a9ca5'
      }
    }
  },
  reducers: {
    addTodo: (state, payload) => {
      return {
        todoList: [...state.todoList, {
          todoText: payload,
          finished: -1,
          created: new Date().getTime()
        }],
        todoText: ''
      }
    },
    toggleTodoItemStatus: (ctx) => {
      return {
        todoList: ctx.todoList.map(todo => {
          if (todo.created === ctx.$item.created) {
            if (todo.finished === -1) {
              todo.finished = new Date().getTime()
            } else {
              todo.finished = -1
            }
          }
          return todo
        })
      }
    },
    setAll: () => {
      return {
        filter: 'all'
      }
    },
    removeTodoItem: (ctx) => {
      return {
        todoList: ctx.todoList.filter(todo => {
          if (todo.created === ctx.$item.created) {
            return false
          } else {
            return true
          }
        })
      }
    },
    setFilterTodo: () => {
      return {
        filter: 'todo'
      }
    },
    setFinishedTodo: () => {
      return {
        filter: 'finished'
      }
    }
  },
  config: {
    state: {
      todoText: {
        label: '待办文本内容'
      },
      todoList: {
        label: '所有待办列表'
      },
      allTodoCount: {
        label: '所有待办数量'
      },
      filter: {
        label: '过滤条件'
      },
      todoItemText: {
        scoped: true,
        label: '待办项文本'
      },
      itemFinished: {
        scoped: true,
        label: '待办项是否完成'
      },
      todoMouseHover: {
        scoped: true,
        label: '待办项鼠标悬浮'
      },
      listItemBackground: {
        scoped: true,
        label: '列表项背景色'
      },
      tabBgAll: {
        label: '标签-所有-背景色'
      },
      tabBgTextColor: {
        scoped: false,
        label: '标签-所有-文字色'
      },
      tabFinshedBgColor: {
        label: '标签-完成-背景色'
      },
      tabFinishedTextColor: {
        scoped: false,
        label: '标签-完成-文字色'
      }
    },
    reducers: {
      addTodo: {
        label: '增加待办'
      },
      toggleTodoItemStatus: {
        label: '切换任务完成状态'
      },
      setAll: {
        label: '设置显示全部待办'
      },
      removeTodoItem: {
        label: '删除待办任务'
      },
      setFilterTodo: {
        label: '设置显示未完成待办'
      },
      setFinishedTodo: {
        label: '设置显示已完成待办'
      }
    }
  }
}
