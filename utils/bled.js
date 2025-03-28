let blueObj = {
	deviceId: '', // 设备id
	servicesUuid: '', // 设备服务uuid
	characteristicId: '', // 设备特征值uuid
};

/**
 * 初始化蓝牙适配器
 * @returns {Promise<unknown>}
 */
export function initBluetooth() {
	if(blueObj.deviceId){
		disconnectDevice();
	}
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
export function startScan(allowDuplicatesKey = false) {
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
export function onDeviceFound(callback) {
	uni.onBluetoothDeviceFound(res => {
	// 回调返回发现的设备数组
		callback(res.devices);
	});
}


/**
* 连接蓝牙设备
* @param {String} deviceId 设备ID
*/
export function connectDevice(deviceId) {
    blueObj.deviceId = deviceId;
    return new Promise((resolve, reject) => {
		uni.createBLEConnection({
			deviceId,
			success: res => {
			  console.log("蓝牙连接成功", res);
			  closeSearch();
			  setTimeout(()=>{
				getBLEDeviceServices().then(resp => {
					if(resp) {
						resolve(res);
					}
				});
			  },1000)
			},
			fail: err => {
			  console.error("蓝牙连接失败", err);
			  reject(err);
			}
		});
    });
}


/**
 * 关闭蓝牙搜索
 */
function closeSearch(){
	uni.stopBluetoothDevicesDiscovery({
		success(res) {
		}
	})
}


/**
 * 获取设备服务与特征值
 * @returns {Promise<unknown>}
 */
export function getBLEDeviceServices(){
	return new Promise((resp,resg) => {
		uni.getBLEDeviceServices({
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			deviceId:blueObj.deviceId,
			success(res) {
				console.log('device services:', res.services);
				if(!res.services.length){
				  getBLEDeviceServices();
				}
				blueObj.servicesUuid = res.services[0].uuid;
				// 获取设备特征值
				uni.getBLEDeviceCharacteristics({
					deviceId: blueObj.deviceId,
					serviceId: res.services[0].uuid,
					success: res => {
						console.log("获取特征值成功", res.characteristics);
						blueObj.characteristicId = res.characteristics.find(
							c => c.properties.write
						)?.uuid;
						
						setTimeout(()=>{
							onDataReceived()
						},1000)
						resp(res.errMsg);
						// uni.notifyBLECharacteristicValueChange({
						// 	state: true, // 启用 notify 功能
						// 	// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
						// 	deviceId:blueObj.deviceId,
						// 	 // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
						// 	serviceId:blueObj.servicesUuid,
						// 	// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
						// 	characteristicId:blueObj.characteristicId,
						// 	success(res) {
						// 		console.log('notifyBLECharacteristicValueChange success', res.errMsg)
						// 		resp(res.errMsg)
						// 	},
						// 	fail(err){
						// 		console.log('notifyBLECharacteristicValueChange success', err);
						// 	}
						// })
						// 向蓝牙设备发送一个0x00的16进制数据
						// const buffer = new ArrayBuffer(1)
						// const dataView = new DataView(buffer)
						// dataView.setUint8(0, 0)
						// uni.writeBLECharacteristicValue({
						//   // 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
						//   deviceId:blueObj.deviceId,
						//   // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
						//   serviceId:blueObj.servicesUuid,
						//   // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
						//   characteristicId:blueObj.characteristicId,
						//   // 这里的value是ArrayBuffer类型
						//   value: 10,
						//   success(res) {
						//     console.log('writeBLECharacteristicValue success', res.errMsg)
						//   }
						// })
					},
					fail: err => {
						resg(err)
					}
			  });
			}
		})
	})
}

/**
 * 启动notify功能
 * @param deviceId
 * @param serviceId
 * @param characteristicId
 * @returns {Promise<unknown>}
 */
export function notifyBLECharacteristicValueChange(deviceId, serviceId, characteristicId) {
	return new Promise((resolve, reject) => {
		uni.notifyBLECharacteristicValueChange({
			state: true, // 启用 notify 功能
			deviceId,
			serviceId,
			characteristicId,
			success: async res => {
				console.log(121213,res);
				resolve(res)
			},
			fail(err) {
				
			}
		});
	})
}


/**
 * 发送数据到蓝牙设备
 * @param data
 * @param encodeFn
 * @returns {Promise<never>|Promise<unknown>}
 */
export function sendData(data, encodeFn = null) {
	if (!blueObj.deviceId || !blueObj.servicesUuid || !blueObj.characteristicId) {
		console.error("请先连接蓝牙设备并获取服务和特征值");
		return Promise.reject(new Error("设备未连接或服务/特征值未获取"));
	}
	// 使用自定义编码函数或默认 TextEncoder
	// let buffer = encodeFn ? encodeFn(data) : new TextEncoder().encode(data).buffer;
	var buf = new ArrayBuffer(data.length);
	var bufView = new Uint8Array(buf);
	for (var i = 0, strLen = data.length; i < strLen; i++) {
	  bufView[i] = data.charCodeAt(i);
	}
	
	return new Promise((resolve, reject) => {
	  uni.writeBLECharacteristicValue({
		deviceId: blueObj.deviceId,
		serviceId: blueObj.servicesUuid,
		characteristicId: blueObj.characteristicId,
		value: buf,
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
 * @param callback
 * @param parseFn
 */
export function onDataReceived(callback, parseFn = null) {
	// uni.onBLECharacteristicValueChange(res => {
	// 	let buffer = new Uint8Array(res.value);
	// 	let data = parseFn ? parseFn(buffer) : String.fromCharCode.apply(null, buffer);
	// 	console.log("收到蓝牙数据：", data);
	// 	callback(data);
	// });
	// // 开启通知监听
	// uni.notifyBLECharacteristicValueChange({
	// 	deviceId: blueObj.deviceId,
	// 	serviceId: blueObj.servicesUuid,
	// 	characteristicId: blueObj.characteristicId,
	// 	state: true,
	// 	success: res => {
	// 		console.log("已开启数据监听", res);
	// 	},
	// 	fail: err => {
	// 		console.error("开启数据监听失败", err);
	// 	}
	// });
	// 必须在这里的回调才能获取
	
	uni.notifyBLECharacteristicValueChange({
	  state: true, // 启用 notify 功能
	  deviceId: blueObj.deviceId,
	  serviceId: blueObj.servicesUuid,
	  characteristicId: blueObj.characteristicId,
	  success(res) {
	    console.log('启用通知成功', res);
	  },
	  fail(err) {
	    console.error('启用通知失败', err);
	  }
	});
	uni.onBLECharacteristicValueChange(function(res) {
	  // 将 ArrayBuffer 转换为字符串或其他所需格式
	  let data = new Uint8Array(res.value);
	  console.log('接收到数据：', data);
	  // 根据需要处理接收到的数据
	});
}

/**
 * 断开蓝牙设备连接
 * @returns {Promise<void>|Promise<unknown>}
 */
export function disconnectDevice() {
	if (!blueObj.deviceId) return Promise.resolve();
		return new Promise((resolve, reject) => {
		    uni.closeBLEConnection({
				deviceId: blueObj.deviceId,
				success: res => {
				  console.log("蓝牙设备已断开", res);
				  blueObj.deviceId = null;
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
 * @returns {Promise<unknown>}
 */
export function closeBluetooth() {
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
