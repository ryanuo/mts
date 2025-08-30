<script setup lang="ts">
import type { Device } from '~/types/device'

interface DeviceConfig {
  key: Device
  name: string
  bg: string
  style: string
  activeClass: string
  inactiveClass: string
  iframe: {
    class: string
    width: number
    height: number
    scale: number
    radius: string
  }
  model: Ref<string>
}

interface Props {
  device: DeviceConfig
  isActive: boolean
  hasActiveDevice: boolean
  protocol: string
  url: string
  scrollBar: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deviceClick: [deviceKey: Device]
}>()

function handleClick() {
  emit('deviceClick', props.device.key)
}
</script>

<template>
  <div
    class="cursor-pointer transition duration-500"
    :class="[
      device.bg,
      device.style,
      isActive
        ? device.activeClass
        : (hasActiveDevice ? device.inactiveClass : ''),
    ]"
    @click.stop="handleClick"
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
