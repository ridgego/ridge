import React from 'react'

/**
 * 将一个数据处理纯函数自动转换为一个数据处理组件
 * @param {Function} func 数据处理纯函数
 * @param {String} fcDefaultTitle 默认标题
 * @returns
 */
export default function (func, fcDefaultTitle) {
  const Component = ({
    output,
    width,
    height,
    color,
    title,
    ...data
  }) => {
    const result = func(data)
    let awaited = null

    if (result && result.then) {
      result.then(r => {
        awaited = r
        output && output(r)
      })
    } else {
      output && output(result)
    }

    const printFun = () => {
      console.log('输入数据', data)
      console.log('输出数据', awaited || result)
    }

    return (
      <div
        style={{ color: color || 'yellow' }}
        onClick={printFun}
      >
        <div> {title || fcDefaultTitle || '未命名'}</div>
      </div>
    )
  }

  return Component
}
