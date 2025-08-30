<script setup lang="ts">
interface Props {
  show: boolean
}
defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

function handleClose() {
  emit('close')
}
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="p-10 bg-white flex inset-0 justify-end fixed z-100">
      <div class="text-2xl cursor-pointer" @click="handleClose">
        <i class="iconfont icon-cancel-1-copy" />
      </div>
    </div>
  </transition>
</template>
