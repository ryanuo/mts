<script setup lang="ts">
import { Dropdown } from 'floating-vue'
import { ref, watch } from 'vue'

enum Device {
  phone = 'phone',
  pad = 'pad',
  computer = 'computer',
  laptop = 'laptop',
}

const activeDevice = ref<Device | ''>('')
const protocol = ref('https')
const url = ref('www.ryanuo.cc')
const phone = ref('')
const pad = ref('')
const computer = ref('')
const laptop = ref('')
const scrollBar = ref(false)
const coverShow = ref(false)

function resetPreview() {
  activeDevice.value = ''
  coverShow.value = false
}
document.body.addEventListener('click', () => void resetPreview())

function handleActiveDevice(device: Device) {
  activeDevice.value = device
  coverShow.value = true
}

watch([phone, pad, computer, laptop], () => {
  url.value = ''
})
watch(url, (n) => {
  url.value = n.replace(/http(s?):\/\//, '')
})
</script>

<template>
  <section class="mx-auto p-t-30 relative">
    <!-- 覆盖层 -->
    <transition name="fade">
      <div v-if="coverShow" class="p-10 bg-white flex inset-0 justify-end fixed z-100">
        <div class="text-2xl cursor-pointer" @click="resetPreview">
          <i class="iconfont icon-cancel-1-copy" />
        </div>
      </div>
    </transition>

    <!-- 设备预览区 -->
    <div class="flex h-[650px] w-[1200px] origin-top items-center left-50% top-50% relative z-105 -translate-x-1/2">
      <!-- 电脑 -->
      <div
        class="bg-[url(/assets/images/new-model/computer.png)] h-[572px] w-[610px] cursor-pointer transition duration-500 left-1/2 top-0 absolute bg-contain bg-no-repeat -translate-x-1/2"
        :class="activeDevice === Device.computer ? 'scale-120 z-9999' : (activeDevice ? 'opacity-0 pointer-events-none' : '')"
        @click.stop="handleActiveDevice(Device.computer)"
      >
        <iframe
          class="border border-gray-200 rounded-3xl left-1/2 top-[10px] absolute -translate-x-1/2"
          :src="`${protocol}://${url || computer}`" :scrolling="scrollBar ? 'yes' : 'no'" width="1340" height="876"
          style="transform:scale(0.44); transform-origin:top center;"
        />
      </div>

      <!-- 笔记本 -->
      <div
        class="bg-[url(/assets/images/new-model/laptop.png)] h-[380px] w-[600px] cursor-pointer scale-90 transition duration-500 left-0 top-50 absolute bg-contain bg-no-repeat"
        :class="activeDevice === Device.laptop ? 'top-50 left-50 -translate-x-1/2 -translate-y-1/2 scale-150 z-9999' : ''"
        @click.stop="handleActiveDevice(Device.laptop)"
      >
        <iframe
          class="rounded-t-xl left-1/2 top-[10px] absolute -translate-x-1/2"
          :src="`${protocol}://${url || laptop}`" :scrolling="scrollBar ? 'yes' : 'no'" width="788" height="506"
          style="transform:scale(0.6); transform-origin:top center;"
        />
      </div>

      <!-- 手机 -->
      <div
        class="bg-[url(/assets/images/new-model/mobile.png)] h-[350px] w-[168px] cursor-pointer scale-80 transition duration-500 left-[56%] top-60 absolute z-2 bg-contain bg-no-repeat"
        :class="activeDevice === Device.phone ? 'top-50 left-50 -translate-x-1/2 -translate-y-1/2 scale-200 z-9999' : ''"
        @click.stop="handleActiveDevice(Device.phone)"
      >
        <iframe
          class="rounded-[60px] left-1/2 top-[8px] absolute -translate-x-1/2"
          :src="`${protocol}://${url || phone}`" :scrolling="scrollBar ? 'yes' : 'no'" width="407" height="877"
          style="transform:scale(0.37); transform-origin:top center;"
        />
      </div>

      <!-- 平板 -->
      <div
        class="bg-[url(/assets/images/new-model/tablet.png)] h-[400px] w-[300px] cursor-pointer transition duration-500 left-[65%] top-40 absolute bg-contain bg-no-repeat"
        :class="activeDevice === Device.pad ? 'top-50 left-50 -translate-x-1/2 -translate-y-1/2 scale-200 z-9999' : ''"
        @click.stop="handleActiveDevice(Device.pad)"
      >
        <iframe
          class="rounded-[40px] left-1/2 top-[10px] absolute -translate-x-1/2"
          :src="`${protocol}://${url || pad}`" :scrolling="scrollBar ? 'yes' : 'no'" width="850" height="1120"
          style="transform:scale(0.332); transform-origin:top center;"
        />
      </div>
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
          <Dropdown placement="bottom" :triggers="['click']" class="border-0 relative">
            <span class="flex cursor-pointer items-center">
              <span class="i-carbon-application-web mr-1" />
              网址
            </span>
            <template #popper>
              <div class="text-sm text-white/80 p-4 rounded-b-xl bg-[#333] min-w-60 shadow">
                <div class="mb-2 flex items-center">
                  <span class="mr-2">笔记本</span>
                  <span>{{ protocol }}://</span>
                  <input
                    v-model.trim="laptop" placeholder="请输入网址"
                    class="text-white/80 ml-2 border-b border-white/30 bg-transparent w-40"
                  >
                </div>
                <div class="mb-2 flex items-center">
                  <span class="mr-2">手机</span>
                  <span>{{ protocol }}://</span>
                  <input v-model.trim="phone" placeholder="请输入网址" class="text-white/80 ml-2 border-b border-white/30 bg-transparent w-40">
                </div>
                <div class="mb-2 flex items-center">
                  <span class="mr-2">平板</span>
                  <span>{{ protocol }}://</span>
                  <input v-model.trim="pad" placeholder="请输入网址" class="text-white/80 ml-2 border-b border-white/30 bg-transparent w-40">
                </div>
                <div class="mb-2 flex items-center">
                  <span class="mr-2">电脑</span>
                  <span>{{ protocol }}://</span>
                  <input
                    v-model.trim="computer" placeholder="请输入网址"
                    class="text-white/80 ml-2 border-b border-white/30 bg-transparent w-40"
                  >
                </div>
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
