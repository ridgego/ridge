export default {
  state: () => {
     return {
        justCaculated: false,
        Display: "",
        历史结果: ""
     }
  },
  getters: {
    hello: (state) => {
      return 'Hello ' + state.name
    }
  },
  actions: {
     输入数字(num) {
       if (this.justCaculated) {
          this.屏幕显示 = num + ""
       } else {
          this.屏幕显示 = this.屏幕显示 + num
       }
     },
     输入运算符(op) {
       this.justCaculated = false
       if (this.屏幕显示 === "") {
         this.屏幕显示 = "0" + op
       } else if (["+","-","*","/"].indexOf(this.屏幕显示.substr(-1)) > -1){
         this.屏幕显示 = this.屏幕显示.substring(0, this.屏幕显示.length - 1) + op
       } else {
         this.屏幕显示 = this.屏幕显示 + op
       }
     },
     等于() {
       if (this.justCaculated) {
         return
       }
       this.历史结果 = this.屏幕显示
       this.屏幕显示 = eval(this.屏幕显示) + ""
       this.justCaculated = true
     },
     输入回退() {
       this.justCaculated = false
       this.屏幕显示 = this.屏幕显示.substring(0, this.屏幕显示.length - 2)
     },
     清空() {
       this.屏幕显示 = ""
       this.历史结果 = ""
     }
  }
}