export default {
  state: {
    textCalc: '',
    tail: ({
      textCalc
    }) => {
      if (textCalc.length > 0) {
        return textCalc[textCalc.length - 1]
      } else {
        return ''
      }
    },
    fullText: ''
  },
  reducers: {
    keyPress: ({ payload, textCalc, tail }) => {
      // 加减乘除按下后，后面按其他操作符号无效果
      if ('+-×÷'.indexOf(payload) > 0 && '+-×÷'.indexOf(tail) > 0) {
        return {}
      }
      return {
        textCalc: textCalc + payload
      }
    },
    clear: () => {
      return {
        fullText: '',
        textCalc: ''
      }
    },
    caculate: ({
      textCalc
    }) => {
      try {
        const result = eval(textCalc.replace(/×/g, '*')
          .replace(/÷/g, '/'))
        return {
          textCalc: result,
          fullText: textCalc + '=' + result
        }
      } catch (e) {
        return {

        }
      }
    },
    backspace: ({
      textCalc
    }) => {
      if (textCalc.length > 0) {
        return {
          textCalc: textCalc.substring(0, textCalc.length - 1)
        }
      } else {
        return {}
      }
    }
  },
  config: {
    state: { textCalc: { label: '待计算区' }, tail: { label: '前面字符' }, fullText: { label: '计算过程' } },
    reducers: { keyPress: '按键按下', clear: '清空数据', caculate: '计算结果', backspace: '按回退键' }
  }
}
