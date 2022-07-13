<template>
	<view class="container">
		<view class="position-relative">
			<image :src="bgImage" class="bg"></image>
		</view>
		
		<view style="padding: 0 30rpx;">
			<!-- user box begin -->
			<view class="d-flex flex-column bg-white user-box">
				
				<view class="d-flex align-items-center">
					<view class="avatar">
						<image :src="isLogin ? user.avatarUrl : '#'"></image>
						<view class="badge" v-if="isLogin">
							<view v-if="user.role=='boss'">店长</view>
							<view v-if="user.role=='manager'">管理员</view>
							<view v-if="user.role=='staff'">店员</view>
							<view v-if="user.role=='user'">用户</view>
						</view>
					</view>
					<view class="d-flex flex-column flex-fill overflow-hidden" style="margin-top: 20rpx;">
						<view v-if="isLogin" class="font-size-lg font-weight-bold d-flex justify-content-start align-items-center"
							@tap="userinfo">
							<view class="text-truncate">{{ user.nickName }} </view>
							<view class="iconfont iconarrow-right line-height-100"></view>
						</view>
						<view v-else class="font-size-lg font-weight-bold" @tap="login">请点击授权登录</view>
						<!-- <view class="font-size-sm text-color-assist">
							当前成长值{{ isLogin ? member.currentValue : 0 }}/{{ isLogin ? member.currentValue + member.needValue : 0 }}
						</view> -->
						<!-- <view class="w-100">
							 <progress percent="0" activeColor="#ADB838" height="8rpx" :percent="growthValue" border-radius="8rpx"/>
						</view> -->
					</view>
				</view>
				<!-- user grid begin -->
				<view class="w-100 d-flex align-items-center just-content-center" v-if="isBussiness">
					<view class="user-grid" @tap="giftCards">
						<view class="value font-size-extra-lg font-weight-bold text-color-base">
							{{  goodsCount }}
						</view>
						<view class="font-size-sm text-color-assist">菜品数</view>
					</view>
					<view class="user-grid" @tap="coupons">
						<view class="value font-size-extra-lg font-weight-bold text-color-base">
							{{  orderCount }}
						</view>
						<view class="font-size-sm text-color-assist">今日订单数</view>
					</view>
					<view class="user-grid" @tap="balance">
						<view class="value font-size-extra-lg font-weight-bold text-color-base">
							{{  income }}
						</view>
						<view class="font-size-sm text-color-assist">今日营业额</view>
					</view>
				</view>
				<!-- user grid end -->
			</view>
		</view>
		<!-- service box begin -->
		<view class="service-box">
			<view class="font-size-lg text-color-base font-weight-bold" style="margin-bottom: 20rpx;">我的服务</view>
			<view class="row">
				<view class="grid" @tap="showInfo" v-if="isBussiness">
					<view class="image">
						<image src="/static/images/mine/dining.png"></image>
					</view>
					<view>店铺资料</view>
				</view>
				<view class="grid" @tap="people" v-if="isBussiness">
					<view class="image">
						<image src="/static/images/mine/person.png"></image>
					</view>
					<view>人员管理</view>
				</view>
				<view class="grid" @tap="typeManager" v-if="isBussiness">
					<view class="image">
						<image src="/static/images/mine/type.png"></image>
					</view>
					<view>品类管理</view>
				</view>
				<view class="grid" @tap="goodsManager" v-if="isBussiness">
					<view class="image">
						<image src="/static/images/mine/goods.png"></image>
					</view>
					<view>菜品管理</view>
				</view>
				<view class="grid" v-if="isBussiness">
					<view class="image" @tap="desk">
						<image src="/static/images/mine/desk.png"></image>
					</view>
					<view>桌号管理</view>
				</view>
				<!-- <view class="grid" @tap="stat">
					<view class="image">
						<image src="/static/images/mine/stat.png"></image>
					</view>
					<view>数据统计</view>
				</view> -->
				<view class="grid" @tap="print" v-if="isBussiness">
					<view class="image">
						<image src="/static/images/mine/print.png"></image>
					</view>
					<view>打印设置</view>
				</view>
				<view class="grid" @tap="feedback">
					<view class="image">
						<image src="/static/images/mine/feedback.png"></image>
					</view>
					<view>问题反馈</view>
				</view>
				
			</view>
		</view>
		<!-- service box end -->
		<u-notify ref="uNotify" ></u-notify>
	</view>
</template>

<script>
	import {mapState, mapGetters,mapActions} from 'vuex'
	import { getUser } from'@/api/userApi.js'
	import { countGoods } from'@/api/goodsApi.js'
	import { countTodayOrder,getTodayIncome } from '@/api/orderApi.js'
	import { getToken,wxLogin } from '@/common/wx.js'
	export default {
		data() {
			return {
				goodsCount : '***',
				orderCount : '***',
				income : '***',
			}
		},
		computed: {
			...mapState(['member','user', 'store']),
			...mapGetters(['isLogin','isBussiness']),
			growthValue() {
				if(!this.isLogin) return 0
				const {currentValue, needValue} = this.member
				return currentValue / (currentValue + needValue) * 100
			},
			bgImage(){
				if(!this.store){
					return ''
				}
				return this.$config.fileUrl + this.store.avatarPath
			}
		},
		async onLoad() {
			uni.$on('refreshData', () => {
			   this.init()
			})
			this.init()
		},
		methods: {
			// ...mapActions(['initBaseData']),
			async init() {
				this.loginInit()
				// await this.initBaseData()
				if (this.isBussiness) {
					countGoods().then(res=>{
						if(res.code == 200){
							this.goodsCount = res.data
						}
					})
					countTodayOrder().then(res=>{
						if(res.code == 200){
							this.orderCount = res.data
						}
					})
					getTodayIncome().then(res=>{
						if(res.code == 200){
							this.income = res.data
						}
					})
				}
			},
			feedback(){
				uni.navigateTo({
					url: '/pages/feedback/feedback'
				})
			},
			desk(){
				uni.navigateTo({
					url: '/pages/desk/desk'
				})
			},
			print(){
				uni.navigateTo({
					url: '/pages/print/print'
				})
			},
			people(){
				uni.navigateTo({
					url: '/pages/people/people'
				})
			},
			stat(){
				this.$refs.uNotify.success('该功能暂未开放')
				// uni.navigateTo({
				// 	url: '/pages/stat/stat'
				// })
			},
			showInfo(){
				uni.navigateTo({
					url: '/pages/store/store'
				})
			},
			goodsManager(){
				uni.navigateTo({
					url: '/pages/goods/goods'
				})
			},
			typeManager(){
				uni.navigateTo({
					url: '/pages/goods/goodsType'
				})
			},
			orders() {
				uni.navigateTo({
					url: '/pages/orders/orders'
				})
			},
			userinfo() {
				uni.navigateTo({
					url: '/pages/mine/userinfo'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
page {
	height: auto;
	min-height: 100%;
}	

.bg {
	width: 100%;
	height: calc(410 / 594 * 600rpx);
}

.hym-btn {
	position: absolute;
	top: 40rpx;
	right: 40rpx;
	color: $color-primary;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50rem;
	font-size: $font-size-sm;
	box-shadow: 0 0 20rpx rgba(66,66,66,0.1);
	&::after {
		border: 0;
	}
	
	image {
		width: 30rpx;
		height: 30rpx;
		margin-right: 10rpx;
	}
}

.user-box {
	position: relative;
	border-radius: 8rpx; 
	margin-bottom: 30rpx;
	min-height: 150rpx;
	margin-top: -115rpx;
	box-shadow: $box-shadow;
}

.avatar {
	position: relative;
	margin-top: -35rpx;
	margin-left: 35rpx;
	margin-right: 35rpx;
	width: 160rpx;
	height: 160rpx;
	border-radius: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #FFFFFF;
	box-shadow: 0 0 20rpx rgba($color: #000000, $alpha: 0.2);
	
	image {
		width: 140rpx;
		height: 140rpx;
		border-radius: 100%;
	}
	
	.badge {
		position: absolute;
		right: -10rpx;
		bottom: -10rpx;
		background-color: #FFFFFF;
		border-radius: 50rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: $color-warning;
		font-size: 24rpx;
		padding: 8rpx 16rpx;
		box-shadow: 0 0 20rpx rgba($color: #000000, $alpha: 0.2);
		
		image {
			width: 30rpx;
			height: 30rpx;
		}
	}
}

.level-benefit {
	margin-left: 35rpx;
	padding: 10rpx 0 10rpx 30rpx;
	border-radius: 50rem 0 0 50rem;
}

.user-grid {
	width: 30%;
	padding: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	
	.value {
		margin-bottom: 20rpx;
	}
}

.level-benefit-box {
	border-radius: 8rpx; 
	margin-bottom: 30rpx;
	box-shadow: 0 10rpx 8rpx rgba($color: #878889, $alpha: 0.1);
	width: 100%;
	display: flex;
	padding: 30rpx;
	flex-direction: column;
	background-color: #FFFFFF;
	
	.row {
		display: flex;
		padding: 30rpx 0 20rpx;
		justify-content: space-around;
		align-items: center;
		
		.grid {
			width: 20%;
			display: flex;
			flex-direction: column;
			font-size: $font-size-sm;
			color: $text-color-assist;
			align-items: center;

			image {
				width: 80rpx;
				height: 80rpx;
				margin-bottom: 10rpx;
			}
		}
	}
}

.banner {
	width: 100%;
	border-radius: 8rpx;
	margin-bottom: 30rpx;
}

.service-box {
	width: 100%;
	background-color: #FFFFFF;
	padding: 32rpx 30rpx 10rpx;
	box-shadow: $box-shadow;
	
	.row {
		display: flex;
		flex-wrap: wrap;
		color: $text-color-assist;
		font-size: $font-size-sm;
		padding-bottom: -40rpx;
		
		.grid {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			margin-bottom: 40rpx;
			width: 25%;
			position: relative;
			
			.image {
				image {
					width: 80rpx;
					height: 80rpx;
					margin-bottom: 20rpx;
				}
			}
			
			.new-badage {
				width: 40rpx;
				height: 40rpx;
				position: absolute;
				top: 0;
				right: 30rpx;
			}
		}
	}
}
</style>
