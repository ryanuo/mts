export enum Device {
  phone = 'phone',
  pad = 'pad',
  computer = 'computer',
  laptop = 'laptop',
}

export interface DeviceConfig {
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
