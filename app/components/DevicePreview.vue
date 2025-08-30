<script setup lang="ts">
import { Dropdown } from 'floating-vue'
import pako from 'pako'
import { ref, watch } from 'vue'

enum Device {
  phone = 'phone',
  pad = 'pad',
  computer = 'computer',
  laptop = 'laptop',
}

// 设备配置数组
const deviceConfigs = [
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
document.body.addEventListener('click', () => void resetPreview())

function handleActiveDevice(device: Device) {
  activeDevice.value = device
  coverShow.value = true
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
    a.download = 'screenshot.png'
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
applyQueryParams()
</script>

<template>
  <section class="mx-auto p-t-30 relative">
    <!-- 截图 loading 蒙层 -->
    <transition name="fade">
      <div v-if="loading" class="bg-black/40 flex items-center inset-0 justify-center fixed z-[99999]">
        <div class="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2" d="M12 6.99998C9.1747 6.99987 6.99997 9.24998 7 12C7.00003 14.55 9.02119 17 12 17C14.7712 17 17 14.75 17 12"><animateTransform attributeName="transform" attributeType="XML" dur="560ms" from="0,12,12" repeatCount="indefinite" to="360,12,12" type="rotate" /></path></svg>
          <span class="text-lg text-white">正在截图，请稍候...</span>
        </div>
      </div>
    </transition>

    <!-- 覆盖层 -->
    <transition name="fade">
      <div v-if="coverShow" class="p-10 bg-white flex inset-0 justify-end fixed z-100">
        <div class="text-2xl cursor-pointer" @click="resetPreview">
          <i class="iconfont icon-cancel-1-copy" />
        </div>
      </div>
    </transition>

    <!-- 设备预览区 -->
    <div class="device-preview-area flex h-[650px] w-[1200px] origin-top items-center left-50% top-50% relative z-105 -translate-x-1/2">
      <template v-for="device in deviceConfigs" :key="device.key">
        <div
          class="cursor-pointer transition duration-500" :class="[
            device.bg,
            device.style,
            activeDevice === device.key
              ? device.activeClass
              : (activeDevice ? device.inactiveClass : ''),
          ]"
          @click.stop="handleActiveDevice(device.key)"
        >
          <iframe
            :class="device.iframe.class"
            :src="`${protocol}://${url || device.model.value}`"
            :scrolling="scrollBar ? 'yes' : 'no'"
            :width="device.iframe.width"
            :height="device.iframe.height"
            :style="`transform:scale(${device.iframe.scale}); transform-origin:top center;`"
          />
        </div>
      </template>
    </div>

    <!-- 顶部控制条 -->
    <transition name="fade">
      <div
        v-if="!activeDevice"
        class="text-white/80 bg-black/80 flex h-16 w-full shadow items-center top-0 justify-center fixed z-999"
      >
        <!-- 网址输入 -->
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
                <svg class="ml-1 h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5.25 7.5L10 12.25L14.75 7.5" /></svg>
              </button>
              <template #popper>
                <div class="text-black rounded bg-white min-w-20 shadow">
                  <div
                    class="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    @click="protocol = 'http'"
                  >
                    http
                  </div>
                  <div
                    class="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    @click="protocol = 'https'"
                  >
                    https
                  </div>
                </div>
              </template>
            </Dropdown>
            <input v-model.trim="url" placeholder="请输入网址" class="ml-2 border-b border-white/30 bg-transparent w-40">
          </div>
        </div>

        <!-- 滚动条开关 -->
        <label class="ml-5 flex cursor-pointer items-center">
          <input v-model="scrollBar" type="checkbox">
          <span class="text-xs ml-2">滚动条</span>
        </label>
        <!-- 截图按钮 -->
        <button
          class="text-xs text-white ml-5 px-2 py-1 rounded bg-black/90 cursor-pointer transition hover:bg-black/80"
          @click="fetchScreenshot"
        >
          截图
        </button>
      </div>
    </transition>
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
