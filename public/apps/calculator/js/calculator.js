export default {
  state: () => {
    return {
      justCalculated: false,
      textInput: '',
      textResult: ''
    }
  },
  getters: {
  },
  actions: {
    // 输入数字
    inputNumber (num) {
      if (this.justCalculated) {
        this.textInput = num + ''
        this.justCalculated = false
      } else {
        this.textInput = this.textInput + num
      }
    },
    // 输入运算符
    inputOperator (op) {
      this.justCalculated = false
      if (this.textInput === '') {
        this.textInput = '0' + op
      } else if (['+', '-', '×', '÷'].indexOf(this.textInput.substr(-1)) > -1) {
        this.textInput = this.textInput.substring(0, this.textInput.length - 1) + op
      } else {
        this.textInput = this.textInput + op
      }
    },
    // 计算
    calculate () {
      if (this.justCalculated) {
        return
      }
      this.textResult = eval(this.textInput.replace(/×/g, '*').replace('÷')) + ''
      this.textInput = this.textInput + '='
      this.justCalculated = true
    },
    back () {
      this.justCaculated = false
      this.屏幕显示 = this.屏幕显示.substring(0, this.屏幕显示.length - 2)
    },
    clear () {
      this.textInput = ''
      this.textResult = ''
    }
  }
}
