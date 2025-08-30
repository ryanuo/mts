<script setup lang="ts">
import { Dropdown } from 'floating-vue'

interface DeviceConfig {
  key: string
  name: string
  model: Ref<string>
}

interface Props {
  deviceConfigs: DeviceConfig[]
  protocol: string
  url: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:protocol': [protocol: string]
  'update:url': [url: string]
}>()

function updateProtocol(protocol: string) {
  emit('update:protocol', protocol)
}

function updateUrl(url: string) {
  emit('update:url', url)
}
</script>

<template>
  <div class="ml-5 flex">
    <!-- 使用浮动弹窗替换原网址弹窗 -->
    <Dropdown placement="bottom" :triggers="['click']" class="border-0 cursor-pointer relative">
      <span class="flex cursor-pointer items-center">
        <span class="i-carbon-application-web mr-1" />
        网址
      </span>
      <template #popper>
        <div class="text-sm text-white/80 p-4 rounded-b-xl bg-[#333] min-w-60 shadow">
          <template v-for="device in deviceConfigs" :key="device.key">
            <div class="mb-2 flex items-center">
              <span class="mr-2">{{ device.name }}</span>
              <span>{{ protocol }}://</span>
              <input
                v-model.trim="device.model.value"
                placeholder="请输入网址"
                class="text-white/80 ml-2 border-b border-white/30 bg-transparent w-40"
              >
            </div>
          </template>
        </div>
      </template>
    </Dropdown>
    <div>
      <!-- 协议选择浮动下拉 -->
      <Dropdown placement="bottom" class="ml-3 inline-block">
        <button class="text-white px-3 rounded-full bg-gray-600 flex h-6 items-center">
          {{ protocol }}
          <svg class="ml-1 h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.25 7.5L10 12.25L14.75 7.5" />
          </svg>
        </button>
        <template #popper>
          <div class="text-black rounded bg-white min-w-20 shadow">
            <div
              class="px-4 py-2 cursor-pointer hover:bg-gray-100"
              @click="updateProtocol('http')"
            >
              http
            </div>
            <div
              class="px-4 py-2 cursor-pointer hover:bg-gray-100"
              @click="updateProtocol('https')"
            >
              https
            </div>
          </div>
        </template>
      </Dropdown>
      <input
        :value="url"
        placeholder="请输入网址"
        class="ml-2 border-b border-white/30 bg-transparent w-40"
        @input="e => updateUrl((e.target as HTMLInputElement).value)"
      >
    </div>
  </div>
</template>
