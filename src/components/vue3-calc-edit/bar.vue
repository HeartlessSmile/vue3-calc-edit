<template>
  <div
    class="edit-textarea-bar"
    v-if="visible"
    :style="barStyle"
    v-click-outside="closeBar"
    @keydown.up.prevent="handleKeydown"
    @keydown.down.prevent="handleKeydown"
    @keydown.esc.prevent="handleKeydown"
    @keydown.enter.prevent="handleKeydown"
  >
    <input v-model="keyword" @change="inputChange" ref="inputRef" class="bar-input"></input>

    <div class="bar-list" ref="barListRef">
      <div
        v-for="(item, index) in resultList"
        :key="index"
        :class="['bar-item', focusIndex == index ? 'focus' : '']"
        @click="handleItemClick(item)"
      >
        <span>{{ item.text }}</span>
      </div>
    </div>

    <div v-show="resultList.length == 0" class="bar-no-data">暂无数据</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import vClickOutside from './util/clickOutSide'
const visible = defineModel('visible')
const barListRef = ref(null)
const inputRef = ref(null)
const focusIndex = ref(-1)
const emit = defineEmits(['itemClick','close'])
const props = defineProps({
  list: {
    type: String,
    default: () => [],
  },
  barStyle: {
    type: Object,
  },
})
const { list } = props
const keyword = ref('')
watch(
  () => props.visible,
  async (val) => {
    if (val) {
      focusIndex.value = -1
      await nextTick()
      barListRef.value.scrollTop = 0
      inputRef.value.focus()
    }
  }
)
watch(
  () => keyword,
  async () => {
    focusIndex.value = -1
    await nextTick()
    focusIndex = resultList.length > 0 ? 0 : -1
  }
)

const inputChange = function (e) {
  keyword.value = e.target.value
}

const resultList = computed(() => {
  return list.filter((item) => {
    return item.text.indexOf(keyword.value) > -1
  })
})

const navigateOptions = function (direction) {
  const optionsLength = resultList.value.length - 1
  if (optionsLength < 0) return
  let index = focusIndex.value + direction
  if (index < 0) index = optionsLength
  if (index > optionsLength) index = 0

  focusIndex.value = index
}

const handleKeydown = function (e) {
  const key = e.key || e.code
  const keyCode = e.keyCode || e.which
  e.preventDefault()

  if (keyCode === 27) {
    closeBar()
  }
  if (key === 'ArrowUp') {
    navigateOptions(-1)
  }
  if (key === 'ArrowDown') {
    navigateOptions(1)
  }
  if (key === 'Enter') {
    if (focusIndex.value === -1) return closeBar()
    emit('itemClick', resultList.value[focusIndex.value])
  }
}

const handleItemClick = function (item) {
  emit('itemClick', item)
}

const closeBar = ()=> {
  if(visible.value){
    visible.value = false
    emit('close')
  }
}

onMounted(() => {})

onBeforeUnmount(() => {})
</script>

<style lang="scss">
.edit-textarea-bar {
  min-width: 200px;
  margin: 5px 0;
  padding: 5px 8px;
  background-color: #fff;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  position: absolute;
  z-index: 900;
  .bar-input{
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
    height: 32px;
    line-height: 1.5;
    padding: 4px 8px;
    font-size: 14px;
    border: 1px solid rgb(220, 222, 226);
    color: rgb(81, 90, 110);
    background-color: rgb(255, 255, 255);
    background-image: none;
    position: relative;
    border-radius: 4px;
    cursor: text;
    transition: border 0.2s ease-in-out 0s, background 0.2s ease-in-out 0s, box-shadow 0.2s ease-in-out 0s, -webkit-box-shadow 0.2s ease-in-out 0s;
    &:hover,
    &:focus{
      border-color: #165DFF;
    }
  }
  .bar-list {
    max-height: 200px;
    overflow: auto;
  }
  .bar-item {
    margin: 0;
    line-height: normal;
    padding: 7px 16px;
    clear: both;
    color: #515a6e;
    font-size: 14px !important;
    white-space: nowrap;
    list-style: none;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
    &:hover {
      background: #f3f3f3;
    }
    &.focus {
      background: #f3f3f3;
    }
  }
  .bar-no-data {
    padding: 5px;
    color: rgba(0, 0, 0, 0.26);
  }
}
</style>
