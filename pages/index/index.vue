<template>
	<view class="content">
		 <view v-if="!connected">
			 <h2>蓝牙设备管理</h2>
			 <!-- 开始扫描 -->
			 <button style="display: inline-block;" @click="startDevice">开始扫描蓝牙设备</button> <button style="display: inline-block;" @click="returnGo">跳转</button>
			 
			 <!-- 显示扫描到的设备 -->
			 <div v-if="devices.length">
			   <h3>扫描到的设备</h3>
			   <ul style="height: 45vh;overflow-y: auto;">
			 	<li 
			 	  v-for="device in devices" 
			 	  :key="device.deviceId"
			 	  @click="connectToDevice(device)"
			 	  style="cursor:pointer"
			 	>
			 	  {{ device.name || '未知设备' }} ({{ device.deviceId }})
			 	</li>
			   </ul>
			 </div>
		 </view>
		<view v-else>
			<!-- 已连接设备显示 -->
			<div>
			  <h3>已连接设备</h3>
			  <p>设备ID: {{ connectedDeviceId }}</p>
			  <button @click="sendMessage">发送数据</button>
			</div>
			
			<!-- 接收的数据 -->
			<div v-if="receivedMessage">
			  <h3>接收数据</h3>
			  <p>{{ receivedMessage }}</p>
			</div>
		</view>
	</view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
// import BluetoothManager from '@/utils/blt.js'  // 修改为你实际的路径
import {initBluetooth, startScan, onDeviceFound, connectDevice, onDataReceived, sendData, getBLEDeviceServices, disconnectDevice} from '@/utils/bled.js'

// 定义响应式变量
const devices = ref([])
const connected = ref(false)
const connectedDeviceId = ref(null)
const receivedMessage = ref('')

onMounted(()=>{
	initBlue();
})

/**
 * 监听应用进入前台
 */
uni.onAppShow(() => {
  initBlue();
});

/**
 * 初始化蓝牙适配器
 * @returns {Promise<void>}
 */
const initBlue = async () => {
  try {
    await initBluetooth();
  } catch (err) {
  }
}

/**
 * 开始扫描蓝牙设备，并监听设备发现
 * @returns {Promise<void>}
 */
const startDevice = async () => {
  try {
    devices.value = [];
    await startScan();
    // 监听扫描到的设备
    onDeviceFound(foundDevices => {
      // 将新扫描到的设备添加到设备列表中
      foundDevices.forEach(device => {
        devices.value.push(device);
      });
      // 去重：根据 deviceId 保留唯一设备
      devices.value = devices.value.filter((device, index, self) =>
        index === self.findIndex(d => d.deviceId === device.deviceId)
      );
      console.log('当前设备列表：', devices.value);
    });
  } catch (err) {
    console.error('扫描蓝牙设备失败', err);
  }
}

/**
 * 连接选中的蓝牙设备，并获取服务、特征值，同时监听数据变化
 * @param data
 * @returns {Promise<void>}
 */
const connectToDevice = async (data) => {
  try {
    await connectDevice(data.deviceId).then(resp => {
		uni.showToast({
			title: '蓝牙连接成功！',
			icon: 'none',
			duration: 2000,
		})
		// onDataReceived(data => {
		//   receivedMessage.value = data
		//   console.log('接收到数据：', data)
		// })
		uni.redirectTo({
			url: '/pages/operate/operate'
		})
	});
    // connected.value = true;
    // connectedDeviceId.value = deviceId
  } catch (err) {
    console.error('连接蓝牙设备失败', err)
  }
}

/**
 * 示例：发送一条文本数据
 * @returns {Promise<void>}
 */
const sendMessage = async () => {
  try {
    await sendData('Hello Bluetooth!')
    console.log('数据发送成功')
  } catch (err) {
    console.error('发送数据失败', err)
  }
}

/**
 * 监听应用进入后台
 */
uni.onAppHide(() => {
  console.log('应用进入后台');
  // 可在此处处理应用进入后台的逻辑
});

/**
 * 进入操作页面
 */
function returnGo(){
	uni.redirectTo({
		url: '/pages/operate/operate'
	})
}

</script>

<style>
.content {
	height: calc(99vh - 30px);
	padding: 26px 10px 10px 10px;
	overflow: hidden;
	box-sizing: border-box;
}
</style>
