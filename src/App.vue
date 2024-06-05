<template>
  <div>
    <vue3CalcEdit :config="config" />
    <span @click="config.contentId = 'kkkkkkkkkk'">add</span>
  </div>
</template>

<script setup>
// import vue3CalcEdit from './components/vue3-calc-edit/index.vue'
import vue3CalcEdit from '../dist/vue3-calc-edit.js'
import '../dist/style.css'
import { ref, onMounted, onBeforeUnmount } from 'vue'
const config = ref({
  // 配置项
  contentId: 'xxss',
  variableList: [
    {
      text: 'MAX',
      type: 'function',
    },
    {
      text: '@AA',
      type: 'project',
    },
    {
      text: '@BB',
      type: 'project',
    },
  ],
})
</script>

<style scoped></style>
