<template>
	<view class="container">
		<view class="invite-box">
			<view class="d-flex flex-column invite-text align-items-center mb-40">
				
				<view v-if="!code">邀请更多成员加入【{{ store.name }}】吧</view>
				<view v-else>邀请您加入【{{ storeName }}】</view>
			</view>
			<view v-if="!code" class="d-flex just-content-center" style="opacity: 0.8;">
				<u-button type="warning" open-type="share" >邀请新成员加入</u-button>
			</view>
			
			<view v-else class="d-flex just-content-center" style="opacity: 0.5;" hover-class="opacity-1" @tap="join">
				<view class="w-90 position-relative">
					<image src="https://img-shop.qmimg.cn//s16/images/2020/04/21/a45e8244188a5ea0.png" class="w-100" mode="widthFix"></image>
				</view>
				<view class="font-size-lg text-color-danger position-absolute d-flex align-items-center mt-30">
					 <view>立即加入</view> 
					<image class="to-invite-img" src="https://img-shop.qmimg.cn/s16/images/2020/04/22/36d4a67a6ede4068.png" mode="widthFix"></image>
				</view>
			</view> 
		</view>
		
	</view>
</template>

<script>
	import { mapState, mapGetters, mapActions } from 'vuex'
	import { GenerateInviteCode,JoinStore } from '@/api/storeApi.js'
	import { showToast } from '@/common/util.js'
	export default {
		data() {
			return {
				code:'',
				storeId:'',
				storeName:''
			}
		},
		computed: {
			...mapState(['store']), 
			...mapGetters(['isLogin']),
		},
		onLoad(option) {
			this.code = option.code
			this.storeId = option.storeId
			this.storeName = option.storeName
			if( !this.isLogin ) {
				this.login()
				return
			}
			if( !this.code ){ // 携带code参数属于邀请连接
				this.getStore()
			}
		},
		async onShareAppMessage(res) {
		   const repo = await GenerateInviteCode();
		   if(repo.code != 200){
			   showToast(repo.msg)
			   return;
		   }
		   return {
			   title: '邀请您加入'+this.store.name,
			   path: `/pages/invite/invite?code=${repo.data}&storeId=${this.store.id}&storeName=${this.store.name}`//分享的页面路径
		   }
		},
		methods:{
			...mapActions(['getStore']),
			login() {
				uni.navigateTo({
					url: '/pages/login/login'
				})
			},
			async join(){
				console.info('join')
				const repo = await JoinStore({code:this.code, storeId:this.storeId})
				console.info(repo)
				if(repo.code == 200) {
					showToast('加入成功')
					uni.navigateTo({
						url:'/pages/mine/mine'
					})
				} else {
					showToast(repo.msg)
				}
			}
		}
	}
</script>

<style lang="scss">
page {
	background: url('https://fish-helper.oss-cn-guangzhou.aliyuncs.com/upload/202206/1654350528-invite.jpg') no-repeat;
	background-size: contain;
	padding: 576rpx 30rpx 0;
	background-position: 50% 50%;
}
.invite-text{
	color:#f0e458a8
}
.invite-box {
	padding: 40rpx 70rpx;
	border-radius: 8rpx;
	display: flex;
	flex-direction: column;
	position: relative;
	margin-bottom: 30rpx;
}

.progress-box {
	width: 100%;
	margin: 20rpx 0;
}

.to-invite-img {
	width: 16rpx;
	margin-left: 10rpx;
}

.opacity-1 {
	opacity: 1 !important;
}

.my-award {
	padding: 60rpx 0;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #FFFFFF;
	border-radius: 8rpx;
	margin-bottom: 30rpx;
	position: relative;
	
	.my-award-img {
		width: 291rpx;
		position: absolute;
		top: -15rpx;
	}
	
	.item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		
		&::after {
			position: absolute;
			content: ' ';
			background-color: #ccc;
			width: 2rpx;
			height: 100%;
			right: 0;
			top: 0;
			transform: scaleY(0.5);
		}
		
		&:nth-last-child(1) {
			&::after {
				width: 0;
			}
		}
	}
}
</style>
