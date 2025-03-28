<template>
	<view class="main">
		<movable-area class="showValue" :style="{background: sliderAreaBg}">
			<view class="up" :style="{width: `${upButtonwidth}px`,background: `linear-gradient(90deg, ${sliderStartColor} 0%, ${sliderEndColor} 100%)` }"></view>
			<movable-view class="sliderView" :out-of-bounds="false" :animation="animation" :x="sliderLength" @change="onChange" @touchend="touchend" direction="horizontal" >
				<view class="buttonPointer" :style="{backgroundColor: sliderButtonColor}"></view>
			</movable-view>
		</movable-area>
	</view>
</template>

<script>
	export default {
		props: {
			// 滑动条的背景颜色
			sliderAreaBg: {
				default: "#E9EDF5"
			},
			
			// 滑动条开始颜色
			sliderStartColor: {
				default: "#537DFC"
			},
			
			// 滑动条结束颜色
			sliderEndColor: {
				default: "#5DBEF2"
			},
			
			// 滑动托柄颜色
			sliderButtonColor: {
				default: "#ffffff"
			},
			
			// 定义滑动条分成几部分，类似于设置步长的效果
			partsCount: {
				default: 5
			}
		},
		data() {
			return {
				bgOffset: 60,
				sliderLength: 0,
				animation: true,
				
				showValue: 0,
				sliderAreaWidth: 360  // 为了确保获取数据正常，设置默认值（适配一般移动端手机）
			}
		},
		watch: {
			sliderLength(newValue) {
				this.sliderLength = newValue
				this.showValue = this.getSliderCurrentPart()
				this.$emit('updateSliderValue', this.getSliderCurrentPart()); // 发送当前部分值给父组件
			}
		},
		computed: {
			upButtonwidth() {
				return this.sliderLength + this.bgOffset
			}
		},
		methods: {
			
			/**
			 * 滑动条进行滑动时执行
			 * @param {Object} event
			 */
			onChange(event) {
				this.sliderLength = event.detail .x
			},
			
			/**
			 * 拖动到位置松开后执行一次
			 */
			
			touchend() {
				this.$emit('change', this.getSliderCurrentPart());
			},
			
			/**
			 * 获取滑动条的宽度信息; 为了适配不同页面长度，调用该函数会自动适配宽度
			 */
			getClientInfoBySelector() {
				uni.createSelectorQuery().in(this).select('.showValue').boundingClientRect((rect) => {
					this.sliderAreaWidth = rect.right - rect.left
					this.showValue = this.getSliderCurrentPart()
				}).exec()
				
				uni.createSelectorQuery().in(this).select('.sliderView').boundingClientRect((rect2) => {
					this.bgOffset = rect2.right - rect2.left
				}).exec()
			},
			
			/**
			 * 设置滑动条的值
			 * @param {Object} sliderNewValue
			 */
			setSliderValue(sliderNewValue) {
				this.animation = false
				
				if(sliderNewValue > this.sliderAreaWidth) {
					this.sliderLength = this.sliderAreaWidth
				} else if (sliderNewValue < 0) {
					this.sliderLength = 0
				} else {
					this.sliderLength = sliderNewValue
				}
				
				this.$nextTick(() => {
					setTimeout(() => {
						this.animation = true
					}, 250)
				})
			},
			
			/**
			 * 根据百分值设置进度条的值
			 * @param {Object} percentageValue 滑动条的百分值
			 */
			setSliderValueByPercentage(percentageValue) {
				const decimalValue =  parseInt(percentageValue) / 100
				const newValue = (this.sliderAreaWidth * decimalValue).toFixed(2)
				
				this.setSliderValue(parseFloat(newValue))
			},
			
			/**
			 * 根据 part 设置滑动条的长度，同下，区域的索引从0开始
			 */
			setSliderValueByPart(part) {
				if(this.partsCount <= 0) return false
				
				const onePatrWidth = Math.ceil(this.sliderAreaWidth / this.partsCount)
				let setValue = onePatrWidth * part
				
				// 优化选择两边的区域时，滑动条留空的问题
				if((part + 1) == this.partsCount) {
					setValue = this.sliderAreaWidth
				} else if (part === 0) {
					setValue = 0
				} else {
					setValue += onePatrWidth / 2
				}
				
				this.setSliderValue(setValue > this.sliderAreaWidth ? this.sliderAreaWidth : setValue)
			},
			
			/**
			 * 获取当前滑动到那个区域，根据 partsCount 的值表示第几个区域，如：第一个区域返回0
			 */
			getSliderCurrentPart() {
				if(this.partsCount <= 0) return false
				
				const onePatrWidth = Math.ceil(this.sliderAreaWidth / this.partsCount)
				let currentPart = 0
				
				for (let i = 0; i < this.partsCount; i++) {
					if(onePatrWidth * i  <= this.sliderLength &&  this.sliderLength <=  (i+1) * onePatrWidth) {
						currentPart = i
						break
					}
				}
				return currentPart
			},
			
			/**
			 * 获取当前进度条移动距离
			 */
			getSliderWidth() {
				return this.sliderLength
			}
		}
	}
</script>

<style lang="scss" scoped>	
.main {
	width: 100%;

	.showValue {
		width: 100%;
		height: 43rpx;
		border-radius: 40rpx;
		position: relative;
		overflow: hidden;
		margin: 0 auto;
		
		.up {
			width: 0%;
			height: 100%;
			position: absolute;
			top: 0;
			border-radius: 50rpx;
			// background: linear-gradient(90deg, #537DFC 0%, #5DBEF2 100%);
		}
		
		.sliderView {
			width: 35rpx;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0 12rpx;
		}
		
		.buttonPointer {
			width: 35rpx;
			height: 35rpx;
			// background-color: white;
			border-radius: 20rpx;
			position: absolute;
		}
	}
}
</style>
