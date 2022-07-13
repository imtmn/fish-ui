<template>
	<view class="app">
		<div class="imgDiv">
			<!-- <image src="../../static/images/mine/bg.jpg" mode="aspectFill"></image> -->
		</div>
		<button class='bottom' type='primary' @click="wxGetUserInfo">
			授权登录
		</button>
		<view class="mt20">单独的授权登录页<br />登陆后会跳到操作前的地址</view>
	</view>
</template>

<script>
	import { wxDecodeUser} from '@/api/sysApi.js';
	import { showToast } from '@/common/util.js'
	import { getUser,saveUser } from'@/api/userApi.js'
	export default {
		data() {
			return {
			}
		},
		methods: {
			wxGetUserInfo(){
				// 获取用户信息
				uni.getUserProfile({
					desc: 'weixin',
					success: res => {
						this.updateUserInfo(res.userInfo)
					},fail:function (fail){console.log("fail:",fail)}
				});
			},
			async updateUserInfo(data){
				if(data){
					const repo = await saveUser({
						"nickName": data.nickName,
						"address": data.province + data.city,
						"gender": data.gender == 0 ? "男":"女",
						"avatarUrl": data.avatarUrl
					})
					if(repo.code == 200){
						uni.$emit('refreshData')
						uni.navigateBack({
							delta: 1
						})
					}
				}else{
					uni.showToast({
						title:"请点击授权按钮进行授权"
					})
				}
			}
		}
	}
</script>


<style scoped lang='scss'>
	.app {
		text-align: center;
		padding: 20px;
	}

	.imgDiv {
		width: 200rpx;
		height: 200rpx;
		margin: 50px auto;

		image {
			width: 100%;
			height: 100%;
			border-radius: 50%;
		}
	}

	.mt20 {
		margin-top: 20px;
	}
</style>
