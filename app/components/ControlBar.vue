<script setup lang="ts">
interface DeviceConfig {
  key: string
  name: string
  model: Ref<string>
}

interface Props {
  deviceConfigs: DeviceConfig[]
  protocol: string
  url: string
  scrollBar: boolean
  loading: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:protocol': [protocol: string]
  'update:url': [url: string]
  'update:scrollBar': [scrollBar: boolean]
  'screenshot': []
}>()

function updateProtocol(protocol: string) {
  emit('update:protocol', protocol)
}

function updateUrl(url: string) {
  emit('update:url', url)
}

function updateScrollBar(scrollBar: boolean) {
  emit('update:scrollBar', scrollBar)
}

function handleScreenshot() {
  emit('screenshot')
}
</script>

<template>
  <div
    class="text-white/80 bg-black/80 flex h-16 w-full shadow items-center top-0 justify-center fixed z-999"
  >
    <!-- 网址输入 -->
    <UrlInput
      :device-configs="deviceConfigs"
      :protocol="protocol"
      :url="url"
      @update:protocol="updateProtocol"
      @update:url="updateUrl"
    />

    <!-- 滚动条开关 -->
    <label class="ml-5 flex cursor-pointer items-center">
      <input
        :checked="scrollBar"
        type="checkbox"
        @change="e => updateScrollBar((e.target as HTMLInputElement).checked)"
      >
      <span class="text-xs ml-2">滚动条</span>
    </label>

    <!-- 截图按钮 -->
    <button
      class="text-xs text-white ml-5 px-2 py-1 rounded bg-black/90 cursor-pointer transition hover:bg-black/80"
      :disabled="loading"
      @click="handleScreenshot"
    >
      截图
    </button>
  </div>
</template>
