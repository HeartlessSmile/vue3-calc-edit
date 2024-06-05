// const compiler = require('vue-template-compiler')
export const doubleSymbol = ['==', '>=', '<=', '!=']
export const singleSymbol = ['+', '-', '*', '/', '>', '<', '(', ')', ',', '%']
export const numberSymbol = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
export const operationSymbol = ['+', '-', '*', '/', '>', '<', ',', ...doubleSymbol]

export const canInputKey = [
  ...singleSymbol,
  ...numberSymbol,
  '=',
  '!',
  '&',
  '|',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]
export const getTagNode = (option = {}) => {
  // 创建模版标签
  let node = document.createElement(option.tag || 'span')
  node.setAttribute('contenteditable', false)
  node.innerHTML = option.text || ''

  // node.setAttribute('class', option.class || '')
  // node.setAttribute('type', option.type || '')
  Object.entries(option).forEach((el) => {
    if (!['tag', 'text'].includes(el[0])) {
      node.setAttribute(`${el[0]}`, el[1])
    }
  })

  return node
}

export const getTextNode = (text) => {
  // 创建模版标签
  return document.createTextNode(text)
}

// 获取当前元素的位置
export const getRangeRect = (range) => {
  if (!range) {
    throw '不存在选区 querySelector'
  }
  let rangeRect = range.getBoundingClientRect()[0] ? range.getBoundingClientRect()[0] : range.getBoundingClientRect()
  return rangeRect
}

// 必须有根节点
export const htmlToNodeList = (html) => {
  // let nodeList = compiler.compile(html).ast.children || []
  // let result = []
  // for (let i = 0; i < nodeList.length; i++) {
  //   const node = nodeList[i]
  //   if (node.type === 1) {
  //     let obj = node.children.find(el => el.type === 3)
  //     // 区分函数和选项
  //     // result.push({ text: obj.text, type: node.attrsMap.type, attrsMap: node.attrsMap })
  //     result.push({ text: obj.text, type: node.attrsMap.type })
  //   } else if (node.type === 3) {
  //     if (node.text) {
  //       let _textArr = handleTextNode(node)
  //       result = result.concat(_textArr)
  //     }
  //   }
  // }
  return result
}

// 处理textNode 将text字符串拆分
export const handleTextNode = (node) => {
  let text = node.text
  let result = []
  let numStr = ''
  let index = 0
  let numIndex = 0
  function insertNum() {
    if (numIndex != index) {
      result.push({ text: text.slice(numIndex, index), type: 'number' })
    }
  }
  while (index < text.length) {
    let doubleStr = text.slice(index, index + 2)
    let singleStr = text.slice(index, index + 1)
    if (doubleSymbol.includes(doubleStr)) {
      insertNum()
      result.push({ text: doubleStr, type: 'symbol' })
      index += 2
      numIndex = index
    } else if (numberSymbol.includes(singleStr)) {
      index++
    } else {
      insertNum()
      result.push({ text: singleStr, type: 'symbol' })
      index++
      numIndex = index
    }
  }
  insertNum()
  return result
}
