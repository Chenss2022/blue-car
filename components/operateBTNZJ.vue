<template>
	<view>
		<div id="circel_container">
			<div @click="center_click()" :class="(item == 0 || item != 5) ? 'yaokong-center yaokong-item' : 'yaokong-center yaokong-item yaokong-hover'">
				确认
			</div>
			<div @click="top_click()" :class="(item == 0 || item != 1) ? 'yaokong-top yaokong-item' : 'yaokong-top yaokong-item yaokong-hover'">
				<img src="../static/img/course-up.png" style="transform: rotate(-45deg);margin:50px;width:32px;height:32px;" />
			</div>
			<div @click="right_click()" :class="(item == 0 || item != 3) ? 'yaokong-right yaokong-item' : 'yaokong-right yaokong-item yaokong-hover'">
				<img src="../static/img/online-school-right.png" style="transform: rotate(-135deg);margin:50px;width:32px;height:32px;"  />
			</div>
			<div @click="bottom_click()" :class="(item == 0 || item != 4) ? 'yaokong-bottom yaokong-item' : 'yaokong-bottom yaokong-item yaokong-hover'">
				<img src="../static/img/course-down.png" style="transform: rotate(135deg);margin:50px;width:32px;height:32px;"  />
			</div>
			<div @click="left_click()" :class="(item == 0 || item != 2) ? 'yaokong-left yaokong-item' : 'yaokong-left yaokong-item yaokong-hover'"> 
				<img src="../static/img/to-back.png" style="transform: rotate(45deg);margin:50px;width:32px;height:32px;"  />
			</div>
		</div>
	</view>
</template>

<script>
	export default{
		name:"operateBTNZJ",
		data(){
			return{
				item:0
			}
		} ,
		methods:{
			top_click(){
				this.clk(1)
				this.$emit("btn_click" , "top")
			} ,
			left_click(){
				this.clk(2)
				this.$emit("btn_click" , "left")
			} ,
			right_click(){
				this.clk(3)
				this.$emit("btn_click" , "right")
			} ,
			bottom_click(){
				this.clk(4)
				this.$emit("btn_click" , "bottom")
			},
			center_click(){
				this.clk(5)
				this.$emit("btn_click" , "center")
			} ,
			clk(idx){
				this.item = idx ;
				var self = this 
				setTimeout(function(){
					self.item = 0
				} , 100)
			}
		}
	}
</script>

<style>
#circel_container{
	width:250px;
	height:250px;
	position: relative;
	top: 0px;
	left: 0px;
	background: #ececec;
	border-radius: 150px;
	border:1px solid #ececec;
}

.yaokong-item{
	width:100%;
	height:100%;
	background:#f7f7f7;
}

.yaokong-top{
	width: 250px;
	height: 250px;
	transform: rotate(45deg);
	border-radius: 150px;
	clip: rect(0px,124px,125px,0px);
	position: absolute;
}

.yaokong-left{
	width: 250px;
	height: 250px;
	transform: rotate(-45deg);
	border-radius: 150px;
	clip: rect(0px,124px,125px,0px);
	position: absolute ;
	top: 0px;
}

.yaokong-right{
	width: 250px;
	height: 250px;
	transform: rotate(135deg);
	border-radius: 150px;
	clip: rect(0px,125px,125px,0px);
	position: absolute;
	top: 0px;
}

.yaokong-bottom{
	width: 250px;
	height: 250px;
	transform: rotate(225deg);
	border-radius: 150px;
	clip: rect(0px,124px,124px,0px);
	position: absolute;
	top: 0px;
}

.yaokong-center{
	width: 100px;
	height: 100px;
	border-radius: 150px;
	position: absolute;
	top: 75px;
	left: 75px;
	border: 1px solid #ececec;
	z-index: 9999;
	text-align: center;
	line-height: 100px;
}

.yaokong-hover{
	background:#efefef;
}
</style>
