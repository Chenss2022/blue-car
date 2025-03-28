<template>
	<view class="box">
		<operateZJVue style="flex: 1;" @remoteCancelAndEnd="remote"/>
		<view class="slider-box" style="flex: 1;">
			<view style="font-size: 3vw;">方向：{{Data.remote || '--'}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;挡位：{{ Data.speed || '0' }}</view>
			<SliderCommonVue
			ref="SliderCommonVueRef"
			partsCount="5"
			@change="handleSliderUpdate"
			/>
		</view>
		<button type="primary" class="returnGo" @click="returnGo">
			返回
		</button>
	</view>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import operateZJVue from '../../components/operateZJ.vue';
import SliderCommonVue from '../../components/slider-common/slider_common.vue';
import { sendData } from '@/utils/bled.js'
import ppSliderVue from '../../uni_modules/pp-slider/components/pp-slider/pp-slider.vue';


const SliderCommonVueRef = ref();
const Data = reactive({
	speed:'',
	remote:'',
})

onMounted(() => {
  if (SliderCommonVueRef.value) {
    // SliderCommonVueRef.value.setSliderValue(50);
  }
});

/**
 * 轮盘返回信息
 * @param val
 */
function remote(val){
	Data.remote = val;
	sendData(`@LED_CARZ_${val}!`);
}

/**
 * 进度条返回的信息
 * @param data
 */
function handleSliderUpdate(data){
	Data.speed = data+1;
	sendData(`@LED_CAR_${Data.speed}!`);
}

/**
 * 返回蓝牙选择页面
 */
function returnGo(){
	uni.redirectTo({
		url: '/pages/index/index'
	})
}

</script>

<style>
.box {
	height: calc(99vh - 30px);
	padding: 26px 10px 10px 10px;
	overflow: hidden;
	box-sizing: border-box;
	display: flex;
	justify-content: space-evenly;
	align-items: center;
	
	.slider-box {
		width: 60%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	
	.returnGo {
		position: fixed;
		top: 20px;
		left: 20px;
		margin: 0;
		padding: 0;
		width: 7vw;
		height:5vw;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}	       
</style>
