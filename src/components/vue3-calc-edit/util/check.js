import { operationSymbol, doubleSymbol, singleSymbol } from './index'
// 验证计算公式是否合法
export const isValidNodeList = nodeList => {
  let errIndex = -1
  let errMsg = ''
  // 当前不能为空
  if (nodeList.length === 0) {
    return { check: false, errMsg: '没有输入任何内容' }
  }
  // 首尾不能是运算符号
  let fistNode = nodeList[0]
  let lastNode = nodeList[nodeList.length - 1]
  if (fistNode.type === 'symbol' && operationSymbol.includes(fistNode.text)) {
    return { check: false, errMsg: '首位不能是运算符号', errIndex: 0 }
  }
  if (lastNode.type === 'symbol' && operationSymbol.includes(lastNode.text)) {
    return { check: false, errMsg: '末尾不能是运算符号', errIndex: nodeList.length - 1 }
  }
  // 1.判断num是不是一个合法的number
  // 2.判断符号是不是存在的
  // 3.能存在连续运算符号，
  // 4.不能存在连续项和函数
  // 5.函数右边必须是左括号
  for (let i = 0; i < nodeList.length; i++) {
    let node = nodeList[i]
    node.index = i
    if (node.type == 'number') {
      let num = Number(node.text)
      if (isNaN(num)) {
        return { check: false, errMsg: '存在不合法的数字', errIndex: i }
      }
    } else if (node.type == 'symbol') {
      let symbol = node.text
      if (![...doubleSymbol, ...singleSymbol].includes(symbol)) {
        return { check: false, errMsg: '存在不合法符号', errIndex: i }
      }

      // 不能存在连续运算符号
      if (operationSymbol.includes(symbol)) {
        let nextNode = nodeList[i + 1]
        if (nextNode && nextNode.type === 'symbol' && operationSymbol.includes(nextNode.text)) {
          return { check: false, errMsg: '存在连续运算符号', errIndex: i }
        }
      }
    } else {
      // 剩下的是函数或者单个项
      let nextNode = nodeList[i + 1]

      // 函数后面必须是左括号
      if (node.type == 'function') {
        if (nextNode && nextNode.type != 'symbol' && nextNode.text != '(') {
          return { check: false, errMsg: '函数后面必须是左括号', errIndex: i }
        }
      }

      if (nextNode && !['symbol', 'number'].includes(nextNode.type)) {
        return { check: false, errMsg: '存在连续函数或者单元项', errIndex: i }
      }
    }
  }
  // 检验括号是不是合法成对的
  let bracketResult = checkBracket(nodeList)
  if (bracketResult.check === false) {
    return bracketResult
  }

  // 检验函数格式是不是正确
  const fnResult = checkFunction(nodeList)
  if (fnResult.check === false) {
    return fnResult
  }

  return {
    check: true
  }
}

// 检查括号是不是成对的
const checkBracket = nodeList => {
  let bracket = []
  for (let i = 0; i < nodeList.length; i++) {
    let node = nodeList[i]
    if (node.type === 'symbol') {
      if (node.text === '(') {
        bracket.push({ text: node.text, errIndex: i })
      } else if (node.text === ')') {
        if ((bracket.pop() || {}).text !== '(') {
          return { check: false, errMsg: '存在不合法的括号', errIndex: i }
        }
      }
    }
  }
  if (bracket.length > 0) {
    return { check: false, errMsg: '存在不合法的括号', errIndex: bracket[bracket.length - 1].i }
  } else {
    return { check: true }
  }
}

// 检查各种自定义函数
const checkFunction = nodeList => {
  let fnList = []
  let index = 0
  let curFnNode = null
  let curIndex = -1
  while (index < nodeList.length) {
    let node = nodeList[index]
    if (node.type === 'function') {
      // 判断一下 下一个元素是不是'('
      let lastNode = nodeList[index + 1]
      if (!lastNode || lastNode.type != 'symbol' || lastNode.text != '(') {
        return { check: false, errMsg: '函数定义错误', errIndex: index }
      }
      if (curFnNode) {
        curFnNode.children.push(node)
      }
      fnList.push(node)
      curFnNode = node
      curIndex = index
      node.children = []
      node.bracket = []
    } else {
      if (curFnNode) {
        if (node.type === 'symbol' && node.text === '(') {
          curFnNode.children.push(node)
          curFnNode.bracket.push(node)
        } else if (node.type === 'symbol' && node.text === ')') {
          curFnNode.children.push(node)
          // 取消左边括号
          curFnNode.bracket.pop()
          if (curFnNode.bracket.length === 0) {
            // 当前函数结束了
            let fn = fnList.pop()
            let itemResult = checkItemFunction(fn)
            curFnNode = fnList.length > 0 ? fnList[fnList.length - 1] : null
          }
        } else {
          curFnNode.children.push(node)
        }
      }
    }
    index++
  }
  return { check: true }
}

function checkItemFunction(node) {
  const { text, children } = node
  return {
    check: true
  }
}
