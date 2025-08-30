<script setup lang="ts">
interface Props {
  loading: boolean
}

defineProps<Props>()
</script>

<template>
  <transition name="fade">
    <div v-if="loading" class="bg-black/40 flex items-center inset-0 justify-center fixed z-[99999]">
      <div class="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2" d="M12 6.99998C9.1747 6.99987 6.99997 9.24998 7 12C7.00003 14.55 9.02119 17 12 17C14.7712 17 17 14.75 17 12">
            <animateTransform attributeName="transform" attributeType="XML" dur="560ms" from="0,12,12" repeatCount="indefinite" to="360,12,12" type="rotate" />
          </path>
        </svg>
        <span class="text-lg text-white">正在截图，请稍候...</span>
      </div>
    </div>
  </transition>
</template>
