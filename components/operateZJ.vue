<template>
	<view style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;">
		<view class="container" :style="{width:containerWH+'rpx',height:containerWH+'rpx'}">
			<view class="core" :style="{width:controlWH+'rpx',height:controlWH+'rpx'}">
				<view class="core_fourview">
					<!-- <view><image src="../../static/img/image/nav-arrow-left.png" mode=""></image></view> -->
					<view :style="dirtion === '上' ? viewActiveStyle:''">
						<uni-icons type="left" size="30"></uni-icons>
					</view>
					<view :style="dirtion === '右' ? viewActiveStyle:''">
						<uni-icons type="left" size="30"></uni-icons>
					</view>
					<view :style="dirtion === '左' ? viewActiveStyle:''">
						<uni-icons type="left" size="30"></uni-icons>
					</view>
					<view :style="dirtion === '下' ? viewActiveStyle:''">
						<uni-icons type="left" size="30"></uni-icons>
					</view>
				</view>
				<!-- 控制的小球 -->
				<view class="curise" @touchmove="move" @touchstart="start" @touchcancel="cancelAndEnd"
				@touchend="cancelAndEnd" :style="{left:left+'rpx',top:top+'rpx',width:circleWH+'rpx',height:circleWH+'rpx',backgroundColor:circleBgColor}"></view>
				<!-- 白底小球 -->
				<view class="curise_fff" :style="{width:colorcircleWH+'rpx',height:colorcircleWH+'rpx',backgroundColor:colorCircleStyle}"></view>
			</view>
		</view>
	
	
	</view>
</template>

<script>
	export default {
		name:"operateZJ",
		props:{
			// 主容器宽高，可以用来扩展阴影
			containerWH:{
				type:Number,
				default:225
			},
			// 整个控制容器的宽高
			controlWH:{
				type:Number,
				default:200
			},
			//判断小球移动多少大于值，开始计算方向与顶边
			comparenum: {
				type: Number,
				default: 50
			},
			//手指超出外圆的范围顶点是哪
			comparewidth: {
				type: Number,
				default: 70
			},
			// 可移动小球的宽高
			circleWH:{
				type:Number,
				default:50
			},
            //可移动小球的背景颜色
			circleBgColor:{
				type:String,
				default:'#5ABF78'
			},
			// 方向盒子确认方向后活动的样式
			viewActiveStyle:{
				type:String,
				default:`background-color:#79F6BC;`
			},
			// 小球移动后原先的小球占点,宽度与高度比移动小球小
			colorcircleWH:{
				type:Number,
				default:47
			},
            //小球移动后原先的小球占点背景颜色
			colorCircleStyle:{
				type:String,
				default:`#fff`
			},
              // 箭头图片宽高大小
			// imgWH:{
			// 	type:String,
			// 	default:50
			// },
				// 箭头图片margin-right值大小
			imgMarRight: {
				type:Number,
				default:20
			},
		},
		data() {
			return {
				left: 0,
				top: 0,
				startx: 0, //x坐标
				starty: 0, //y坐标
				dirtion:'',
			}
		},
		onLoad() {

		},
		methods: {
			do(direct) {
				this.$emit('remote', direct);
				// this.dirtion = direct
			},
			// 移动时
			move(e) {
				// 向上移，Y轴的值减小，向下移，Y轴的值增大 | 向左移，X轴的值在减小，向右移X轴的值在增大
				// console.log('eX',e.touches[0].clientX,'eY',e.touches[0].clientY);
				const templeft = (e.touches[0].clientX - this.startx) * 1
				const temptop = (e.touches[0].clientY - this.starty) * 1

				if (Math.sqrt(Math.pow(templeft, 2) + Math.pow(temptop, 2)) >= this.comparenum) {
					let angle = Math.atan(Math.abs(templeft) / Math.abs(temptop))
					let rad = (180 * angle / Math.PI)
					let cx = 0
					let cy = 0
					let r = this.comparewidth
					//第一象限(右上)
					if (this.startx < e.touches[0].clientX && this.starty > e.touches[0].clientY) {
						cx = Math.cos(angle) * -r;
						cy = Math.sin(angle) * r;
					}
					//第三象限(左下)
					if (this.startx > e.touches[0].clientX && this.starty < e.touches[0].clientY) {
				
						cx = Math.cos(angle) * r;
						cy = Math.sin(angle) * -r;
					}
					//第四象限(右下)
					if (this.startx < e.touches[0].clientX && this.starty < e.touches[0].clientY) {
						cx = Math.cos(angle) * r;
						cy = Math.sin(angle) * r;
					}
					//第二象限(左上)
					if (this.startx >= e.touches[0].clientX && this.starty >= e.touches[0].clientY) {
						cx = Math.cos(angle) * -r;
						cy = Math.sin(angle) * -r;
					}
				
					//上
					if (e.touches[0].clientY - this.starty < 0 && rad < 45) {
						// console.log("上")
						this.dirtion = 'up'
						this.do('上');
					}
					//右
					if (e.touches[0].clientX - this.startx > 0 && rad >= 45) {
						// console.log("右")
						this.dirtion = 'right'
						this.do('右');
					}
					//下
					if (e.touches[0].clientY - this.starty > 0 && rad < 45) {
						// console.log("下")
						this.dirtion = 'down'
						this.do('下');
					}
					//左
					if (e.touches[0].clientX - this.startx < 0 && rad >= 45) {
						// console.log("左")
						this.dirtion = 'left'
						this.do('左');
					}
					
					this.left = cy*2
					this.top = cx*2
				} else {
					this.left = templeft*2
					this.top = temptop*2
				}
			},
			// 开始时
			start(e) {
				this.startx = e.touches[0].clientX
				this.starty = e.touches[0].clientY
				// console.log('X轴', this.startx, 'Y轴', this.starty);
			},
			// 意外取消时与完成时
			cancelAndEnd(e) {
				this.left = 0
				this.top = 0
				this.$emit('remoteCancelAndEnd',this.dirtion)
				this.dirtion = ''
			}
		}
	}
</script>

<style lang="scss" scoped>
.container{
	border-radius: 50%;
	background-color: #F4F4F4;
	display: flex;
	justify-content: center;
	align-items: center;
	
	.core{
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		background-color: #FFF;
		overflow: hidden;
		position: relative;
		
		.core_fourview{
			width: 100%;
			height: 100%;
			display: flex;
			flex-wrap: wrap;
			transform: rotate(45deg);
			
			>view:nth-child(-n+4) {
				width: 100rpx;
				height: 100rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				
				image{
					width: 25rpx;
					height: 25rpx;
				}
			}
			>view:nth-child(1)>.uni-icons{
				transform: rotate(45deg);
				// margin-right: 20rpx;
			}
			>view:nth-child(2)>.uni-icons{
				transform: rotate(135deg);
				// margin-right: 20rpx;
			}
			>view:nth-child(3)>.uni-icons{
				transform: rotate(-45deg);
				// margin-right: 20rpx;
			}
			>view:nth-child(4)>.uni-icons{
				transform: rotate(-135deg);
				// margin-right: 20rpx;
			}
		}
	}
	
	
	.curise {
		position: absolute;
		top: 0rpx;
		left: 0rpx;
		bottom: 0rpx;
		right: 0rpx;
		margin: auto;
		width: 50rpx;
		height: 50rpx;
		background-color: #808080;
		border-radius: 50%;
		z-index: 9;
		
	}
	.curise_fff{
		position: absolute;
		top: 0rpx;
		left: 0rpx;
		bottom: 0rpx;
		right: 0rpx;
		margin: auto;
		// width: 96rpx;
		// height: 96rpx;
		// background-color: #fff; 
		border-radius: 50%;
		z-index: 8;
	}
}
	
</style>

