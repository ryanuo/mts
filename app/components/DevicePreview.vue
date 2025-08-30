<script setup lang="ts">
import type { DeviceConfig } from '~/types/device'
import pako from 'pako'
import { ref, watch } from 'vue'
import { Device } from '~/types/device'
import ControlBar from './ControlBar.vue'
import CoverOverlay from './CoverOverlay.vue'
import DeviceFrame from './DeviceFrame.vue'
import LoadingOverlay from './LoadingOverlay.vue'

// 设备配置数组
const deviceConfigs: DeviceConfig[] = [
  {
    key: Device.computer,
    name: '电脑',
    bg: 'bg-[url(/assets/images/new-model/computer.png)]',
    style: 'h-[572px] w-[610px] left-1/2 top-0 absolute bg-contain bg-no-repeat -translate-x-1/2',
    activeClass: 'scale-120 z-9999',
    inactiveClass: 'opacity-0 pointer-events-none',
    iframe: {
      class: 'border border-gray-200 rounded-3xl left-1/2 top-[10px] absolute -translate-x-1/2',
      width: 1340,
      height: 876,
      scale: 0.44,
      radius: '',
    },
    model: ref(''),
  },
  {
    key: Device.laptop,
    name: '笔记本',
    bg: 'bg-[url(/assets/images/new-model/laptop.png)]',
    style: 'h-[380px] w-[600px] scale-90 left-0 top-50 absolute bg-contain bg-no-repeat',
    activeClass: 'top-50 left-50 -translate-x-1/2 -translate-y-1/2 scale-150 z-9999',
    inactiveClass: '',
    iframe: {
      class: 'rounded-t-xl left-1/2 top-[10px] absolute -translate-x-1/2',
      width: 788,
      height: 506,
      scale: 0.6,
      radius: '',
    },
    model: ref(''),
  },
  {
    key: Device.phone,
    name: '手机',
    bg: 'bg-[url(/assets/images/new-model/mobile.png)]',
    style: 'h-[350px] w-[168px] scale-80 left-[56%] top-60 absolute z-2 bg-contain bg-no-repeat',
    activeClass: 'top-50 left-50 -translate-x-1/2 -translate-y-1/2 scale-200 z-9999',
    inactiveClass: '',
    iframe: {
      class: 'rounded-[60px] left-1/2 top-[8px] absolute -translate-x-1/2',
      width: 407,
      height: 877,
      scale: 0.37,
      radius: '',
    },
    model: ref(''),
  },
  {
    key: Device.pad,
    name: '平板',
    bg: 'bg-[url(/assets/images/new-model/tablet.png)]',
    style: 'h-[400px] w-[300px] left-[65%] top-40 absolute bg-contain bg-no-repeat',
    activeClass: 'top-50 left-50 -translate-x-1/2 -translate-y-1/2 scale-200 z-9999',
    inactiveClass: '',
    iframe: {
      class: 'rounded-[40px] left-1/2 top-[10px] absolute -translate-x-1/2',
      width: 850,
      height: 1120,
      scale: 0.332,
      radius: '',
    },
    model: ref(''),
  },
]

const activeDevice = ref<Device | ''>('')
const protocol = ref('https')
const url = ref('www.ryanuo.cc')
const scrollBar = ref(false)
const coverShow = ref(false)
const loading = ref(false)

function resetPreview() {
  activeDevice.value = ''
  coverShow.value = false
}

function handleActiveDevice(device: Device) {
  activeDevice.value = device
  coverShow.value = true
}

function handleCloseCover() {
  resetPreview()
}

async function fetchScreenshot() {
  loading.value = true
  try {
    // 获取当前预览的 url
    let targetUrl = ''
    if (activeDevice.value) {
      const device = deviceConfigs.find(d => d.key === activeDevice.value)
      targetUrl = device?.model.value || url.value
    }
    else {
      targetUrl = url.value
    }
    // 构造 config 对象
    const configObj = {
      protocol: protocol.value,
      url: targetUrl,
    }
    // 压缩加密
    const json = JSON.stringify(configObj)
    const gz = pako.gzip(json)
    const b64 = btoa(String.fromCharCode(...gz))
    const res = await $fetch<Blob>(`/api/screenshot?config=${encodeURIComponent(b64)}`, {
      responseType: 'blob',
    })
    // 下载 blob
    const blobUrl = window.URL.createObjectURL(res)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = 'screenshot.jpg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(blobUrl)
  }
  catch (err) {
    console.error('截图失败', err)
  }
  finally {
    loading.value = false
  }
}

// 监听所有设备输入框，清空主url
watch(deviceConfigs.map(d => d.model), () => {
  url.value = ''
})
watch(url, (n) => {
  url.value = n.replace(/http(s?):\/\//, '')
})

// 解码 config 参数（base64+gzip）
function decodeConfigParam(str: string) {
  try {
    const binary = atob(str)
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
    const json = pako.ungzip(bytes, { to: 'string' })
    return JSON.parse(json)
  }
  catch (e) {
    console.error('config参数解码失败', e)
    return null
  }
}

// 解析地址栏参数并设置相关变量
function applyQueryParams() {
  const params = new URLSearchParams(window.location.search)
  // 优先使用 config 参数
  const configStr = params.get('config')
  if (configStr) {
    const cfg = decodeConfigParam(configStr)
    if (cfg) {
      if (cfg.protocol)
        protocol.value = cfg.protocol
      if (cfg.url)
        url.value = cfg.url
      if (cfg.activeDevice && deviceConfigs.some(d => d.key === cfg.activeDevice))
        activeDevice.value = cfg.activeDevice
      if (cfg.deviceModels && typeof cfg.deviceModels === 'object') {
        deviceConfigs.forEach((d) => {
          if (cfg.deviceModels[d.key])
            d.model.value = cfg.deviceModels[d.key]
        })
      }
      return // 已处理，无需继续
    }
  }
  // 兼容原有参数
  const proto = params.get('protocol')
  const mainUrl = params.get('url')
  if (proto === 'http' || proto === 'https')
    protocol.value = proto
  if (mainUrl)
    url.value = mainUrl
  deviceConfigs.forEach((cfg) => {
    const modelParam = params.get(`model_${cfg.key}`)
    if (modelParam)
      cfg.model.value = modelParam
  })
}

// 初始化
document.body.addEventListener('click', () => void resetPreview())
applyQueryParams()
</script>

<template>
  <section class="mx-auto p-t-30 relative">
    <!-- 截图 loading 蒙层 -->
    <LoadingOverlay :loading="loading" />

    <!-- 覆盖层 -->
    <CoverOverlay :show="coverShow" @close="handleCloseCover" />

    <!-- 设备预览区 -->
    <div class="device-preview-area flex h-[650px] w-[1200px] origin-top items-center left-50% top-50% relative z-105 -translate-x-1/2">
      <DeviceFrame
        v-for="device in deviceConfigs"
        :key="device.key"
        :device="device"
        :is-active="activeDevice === device.key"
        :has-active-device="!!activeDevice"
        :protocol="protocol"
        :url="url"
        :scroll-bar="scrollBar"
        @device-click="handleActiveDevice"
      />
    </div>

    <!-- 顶部控制条 -->
    <ControlBar
      v-if="!activeDevice"
      :device-configs="deviceConfigs"
      :protocol="protocol"
      :url="url"
      :scroll-bar="scrollBar"
      :loading="loading"
      @update:protocol="protocol = $event"
      @update:url="url = $event"
      @update:scroll-bar="scrollBar = $event"
      @screenshot="fetchScreenshot"
    />
  </section>
</template>

<style>
/* 过渡动画（保留） */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
