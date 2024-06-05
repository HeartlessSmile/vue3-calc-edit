<template>
  <div class="edit-tag-textarea" ref="textareaRef">
    <!-- 这里是编辑区域 -->
    <div
      class="edit-tag-textarea_input"
      ref="textareaContentRef"
      contenteditable="true"
      :id="options.contentId"
      @keydown="handleKeyDown"
    ></div>
    <!-- 工具栏 -->
    <EditTextareaBar
      ref="EditTextareaBarRef"
      v-model:visible="showBar"
      :barStyle="barStyle"
      :defaultKey="keywordForBar"
      :list="options.variableList"
      @itemClick="handleBarItemClick"
      @close="handleBarChange"
    />
    <!-- 检查区 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, reactive } from 'vue'
import { getTextNode, getTagNode, getRangeRect, htmlToNodeList } from './util/index'
import EditTextareaBar from './bar.vue'
const numberKey = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
const defaultConfig = {
  contentId: 'contentId',
  openKey: ['@'],
  canInputKey: [...numberKey, '+', '-', '*', '/', '>', '<', '(', ')', ',', '%', '=','a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  variableList: [],
}
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  config: {
    type: Object,
    default: () => {
      return {}
    },
  },
})
const { config } = props
const options = computed(() => {
  return { ...defaultConfig, ...config }
})

const emit = defineEmits(['update:modelValue'])

const textareaRef = ref(null)
const textareaContentRef = ref(null)
const EditTextareaBarRef = ref(null)
const savedRange = ref(null)
// 当前tip弹框
const barStyle = ref({
  left: 0,
  top: 0,
})

const showBar = ref(false)


const handleInput = function (e) {}

const handleKeyUp = function (e) {}

const handleKeyDown = function (e) {
  const { canInputKey, openKey } = options.value
  const { key } = e
  let canArr = ['Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
 
  if (canArr.includes(key)) {
    showBar.value = false
  } else if (!canInputKey.includes(key)) {
    if (openKey.includes(key)) {
      openVariable(key)
    }
    e.preventDefault()
  } else if (key == '(' || key == ')') {
    insertBracket(key)
    e.preventDefault()
  }
}

// 保存选区
const indexForBar = ref('')
const keywordForBar = ref('')
// 打开变量栏
const openVariable = function (key) {
  keywordForBar.value = key
  indexForBar.value = savedRange.value.startOffset

  savedRange.value.collapse()

  let rangeRect = {}
  let extraWidth = 0
  if (savedRange.value.endContainer === textareaContentRef.value && savedRange.value.endOffset != 0) {
    let index = savedRange.value.endOffset
    savedRange.value.setStart(textareaContentRef.value, index - 1)
    rangeRect = getRangeRect(savedRange.value)
    extraWidth = rangeRect.width
    savedRange.value.setStart(textareaContentRef.value, index)
  } else {
    rangeRect = getRangeRect(savedRange.value)
  }

  const parentRect = textareaRef.value.getClientRects()[0]
  let left = rangeRect.left - parentRect.left + extraWidth
  left = left < 0 ? 10 : left
  let top = rangeRect.top - parentRect.top
  top = top < 0 ? 29 : top + 20
  barStyle.value = { left: left + 'px', top: top + 'px' }
  showBar.value = true
}

const handleBarItemClick = function (item) {
  showBar.value = false
  savedRange.value.setStart(savedRange.value.endContainer, indexForBar.value)
  savedRange.value.deleteContents()
  savedRange.value.collapse()
  insertData(item)
}
// 插入数据
const insertData = function (item) {
  if (item.type == 'symbol' || item.type == 'number') {
    if (item.title === '(' || item.title === ')') {
      insertBracket(item.text)
    } else {
      insertText(item.text)
    }
  } else {
    let node = getTagNode({
      class: `custom-item primary ${item.type}-item`,
      text: item.text,
      tag: 'span',
      type: item.type || 'variable',
    })
    insertNode(node)
  }
}

const handleBarChange = function (e) {
  if (!savedRange.value) {
    return false
  }
  setTimeout(() => {
    let select = window.getSelection()
    select.removeAllRanges()
    select.addRange(savedRange.value)
  }, 20)
}
// 插入括号
const insertBracket = function (text) {
  let node = getTagNode({ class: 'custom-item bracket-item', text, tag: 'span', type: 'symbol' })
  insertNode(node)
}
// 插入文本
const insertText = function (text) {
  let node = getTextNode(text)
  insertNode(node)
}
// 插入元素标签
const insertNode = function (node) {
  if (!node) {
    return
  }
  if (savedRange.value) {
    // 删掉选中的内容（如有）
    savedRange.value.deleteContents()
    // 插入标签
    savedRange.value.insertNode(node)

    // 插入后焦点重新移动到对应的位置
    let movePosition = savedRange.value.endOffset
    window.getSelection().collapse(textareaContentRef.value, movePosition)
  } else {
    // 聚焦
    textareaContentRef.value.focus()
    let range = document.createRange()
    range.selectNodeContents(textareaContentRef.value)
    range.collapse(false)
    let sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
    setTimeout(() => {
      this.insertNode(node)
    }, 10)
  }
}
function selectHandler() {
  // 监听选定文本的变动
  let sel = window.getSelection()
  let range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null
  if (range && range.commonAncestorContainer.ownerDocument.activeElement.id === options.value.contentId) {
    savedRange.value = range
  }
}

onMounted(() => {
  if (props.modelValue) {
    textareaContentRef.value.innerHTML = props.modelValue
  }
  document.addEventListener('selectionchange', selectHandler)
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', selectHandler)
})
</script>

<style lang="scss">
.edit-tag-textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #dcdcdc;
  position: relative;

  &_input {
    min-height: 300px;
    min-width: 200px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 8px;
    line-height: 1.5;
    word-break: break-all;
    text-align: left;
    color: rgba($color: #000000, $alpha: 0.8);
    &:focus {
      outline: none;
    }
  }
  &.has-check-footer {
    .edit-tag-textarea_input {
      height: calc(100% - 32px);
    }
  }
  .custom-item {
    white-space: nowrap;
    border-radius: 2px;
    cursor: default;
    position: relative;
  }
  .custom-item.primary {
    color: #165dff;
    padding: 0 2px;
    margin: 0 2px;
  }
  .bracket-item {
    padding: 0 2px;
    &.hover-primary {
      background: #165dff;
      color: #fff;
      font-weight: bold;
    }
    &.hover-error {
      background: var(--error-color);
      color: #fff;
      font-weight: bold;
    }
  }

  .hover-box {
    position: absolute;
    left: 0px;
    top: 20px;
    // width: 200px;
    background: #fff;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
    color: rgba($color: #000000, $alpha: 0.9);
    padding: 8px;
    border-radius: 2px;
    display: none;
  }
  .function-item:hover {
    cursor: pointer;
    .hover-box {
      display: inline-block;
    }
  }

  .active {
    background: #dcdfe6;
  }
}

.edit-tag-textarea_select {
  padding: 8px;
  .select-item {
    display: inline-block;
    margin-right: 8px;
    padding: 2px 8px;
    background: #409eff;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
  }
}
.check-box {
  height: 32px;
  background: #eeeeee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  .check-success {
    color: #00b57d;
  }
  .check-error {
    color: #ff4d4f;
  }
}
</style>
