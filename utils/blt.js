export default class BluetoothManager {
  constructor() {
    this.deviceId = null; // 连接的设备ID
    this.serviceId = null; // 设备的服务UUID
    this.characteristicId = null; // 设备的特征UUID
  }

  /**
   * 初始化蓝牙适配器
   */
  initBluetooth() {
    return new Promise((resolve, reject) => {
      uni.openBluetoothAdapter({
        success: res => {
          console.log("蓝牙适配器初始化成功", res);
          resolve(res);
        },
        fail: err => {
          console.error("蓝牙初始化失败", err);
		  // 提示用户开启蓝牙，并跳转到系统设置页面
		  uni.showModal({
			title: '蓝牙未开启',
			content: '请开启手机蓝牙后重试',
			showCancel: false,
			success: modalRes => {
			  if (modalRes.confirm) {
				if (uni.getSystemInfoSync().platform === 'android') {
				  var main = plus.android.runtimeMainActivity();
				  var Intent = plus.android.importClass("android.content.Intent");
				  var mIntent = new Intent('android.settings.BLUETOOTH_SETTINGS');
				  main.startActivity(mIntent);
				} else {
				  console.error("该功能仅支持在 Android 平台上使用");
				}
			  }
			}
		  });
          // 此处可加入全局错误提示，如 Toast 通知
          reject(err);
        }
      });
    });
  }

  /**
   * 开始扫描蓝牙设备
   * @param {Boolean} allowDuplicatesKey 是否允许重复发现设备，默认 false
   */
  startScan(allowDuplicatesKey = false) {
    return new Promise((resolve, reject) => {
      uni.startBluetoothDevicesDiscovery({
        allowDuplicatesKey,
        success: res => {
          console.log("开始搜索蓝牙设备", res);
          resolve(res);
        },
        fail: err => {
          console.error("蓝牙搜索失败", err);
          reject(err);
        }
      });
    });
  }

  /**
   * 监听发现蓝牙设备
   * @param {Function} callback 回调函数，参数为设备数组
   */
  onDeviceFound(callback) {
    uni.onBluetoothDeviceFound(res => {
      // 回调返回发现的设备数组
      callback(res.devices);
    });
  }

  /**
   * 连接蓝牙设备
   * @param {String} deviceId 设备ID
   */
  connectDevice(deviceId) {
    this.deviceId = deviceId;
    return new Promise((resolve, reject) => {
      uni.createBLEConnection({
        deviceId,
        success: res => {
          console.log("蓝牙连接成功", res);
		  uni.stopBluetoothDevicesDiscovery({
		    success(res) {
		      console.log(res)
		    }
		  })
		  setTimeout(()=>{
			  uni.getBLEDeviceServices({
			    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			    deviceId,
			    success(res) {
			      console.log('device services:', res.services)
				  uni.getBLEDeviceCharacteristics({
				    deviceId: deviceId,
				    serviceId: res.services[0].uuid,
				    success: res => {
				      console.log("获取特征值成功", res.characteristics);
					  console.log(res.characteristics.find(
					    c => c.properties.write
					  ));
					  this.characteristicId = res.characteristics.find(
					    c => c.properties.write
					  )?.uuid;
				    },
				    fail: err => {
				      console.error("获取特征值失败", err);
				      reject(err);
				    }
				  });
			    }
			  })
		  },1000)
          resolve(res);
        },
        fail: err => {
          console.error("蓝牙连接失败", err);
          reject(err);
        }
      });
    });
  }

  /**
   * 获取设备的服务
   */
  getDeviceServices() {
    return new Promise((resolve, reject) => {
	console.log(111,this.deviceId);
      setTimeout(()=>{
		  uni.getBLEDeviceServices({
		    deviceId: this.deviceId,
		    success: res => {
		      console.log("获取服务成功", res);
		      // 默认使用第一个服务
		      if (res.services && res.services.length > 0) {
		        this.serviceId = res.services[0].uuid;
		      }
		      resolve(res.services);
		    },
		    fail: err => {
		      console.error("获取服务失败", err);
		      reject(err);
		    }
		},1000);
	  })
    });
  }

  /**
   * 获取设备的特征值
   */
  getCharacteristics() {
    return new Promise((resolve, reject) => {
      uni.getBLEDeviceCharacteristics({
        deviceId: this.deviceId,
        serviceId: this.serviceId,
        success: res => {
          console.log("获取特征值成功", res.characteristics);
          // 兼容 write 与 writeWithoutResponse 两种写入方式
          this.characteristicId = res.characteristics.find(
            c => c.properties.write || c.properties.writeWithoutResponse
          )?.uuid;
          if (!this.characteristicId) {
            console.warn("未找到可写的特征值");
          }
          resolve(res.characteristics);
        },
        fail: err => {
          console.error("获取特征值失败", err);
          reject(err);
        }
      });
    });
  }

  /**
   * 发送数据到蓝牙设备
   * @param {String|ArrayBuffer} data 数据
   * @param {Function} [encodeFn] 可选的编码函数，将 data 转换为 ArrayBuffer
   */
  sendData(data, encodeFn = null) {
    if (!this.deviceId || !this.serviceId || !this.characteristicId) {
      console.error("请先连接蓝牙设备并获取服务和特征值");
      return Promise.reject(new Error("设备未连接或服务/特征值未获取"));
    }
    // 使用自定义编码函数或默认 TextEncoder
    let buffer = encodeFn ? encodeFn(data) : new TextEncoder().encode(data).buffer;
    return new Promise((resolve, reject) => {
      uni.writeBLECharacteristicValue({
        deviceId: this.deviceId,
        serviceId: this.serviceId,
        characteristicId: this.characteristicId,
        value: buffer,
        success: res => {
          console.log("发送数据成功", res);
          resolve(res);
        },
        fail: err => {
          console.error("发送数据失败", err);
          reject(err);
        }
      });
    });
  }

  /**
   * 监听蓝牙设备数据变化
   * @param {Function} callback 回调函数，参数为解析后的数据
   * @param {Function} [parseFn] 可选的解析函数，将收到的 buffer 转换为需要的数据格式
   */
  onDataReceived(callback, parseFn = null) {
    uni.onBLECharacteristicValueChange(res => {
      let buffer = new Uint8Array(res.value);
      let data = parseFn ? parseFn(buffer) : String.fromCharCode.apply(null, buffer);
      console.log("收到蓝牙数据：", data);
      callback(data);
    });
	console.log(this.deviceId ,this.serviceId ,this.characteristicId);
    // 开启通知监听
    uni.notifyBLECharacteristicValueChange({
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      characteristicId: this.characteristicId,
      state: true,
      success: res => {
        console.log("已开启数据监听", res);
      },
      fail: err => {
        console.error("开启数据监听失败", err);
      }
    });
  }

  /**
   * 断开蓝牙设备连接
   */
  disconnectDevice() {
    if (!this.deviceId) return Promise.resolve();
    return new Promise((resolve, reject) => {
      uni.closeBLEConnection({
        deviceId: this.deviceId,
        success: res => {
          console.log("蓝牙设备已断开", res);
          this.deviceId = null;
          resolve(res);
        },
        fail: err => {
          console.error("断开连接失败", err);
          reject(err);
        }
      });
    });
  }

  /**
   * 关闭蓝牙适配器
   */
  closeBluetooth() {
    return new Promise((resolve, reject) => {
      uni.closeBluetoothAdapter({
        success: res => {
          console.log("蓝牙适配器已关闭", res);
          resolve(res);
        },
        fail: err => {
          console.error("关闭蓝牙适配器失败", err);
          reject(err);
        }
      });
    });
  }
}
