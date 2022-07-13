<template>
	<view class="container position-relative">
		<view style="margin-bottom: 130rpx;">
			<view class="section-1">
				<template >
					<list-cell class="location">
						<view class="flex-fill d-flex justify-content-between align-items-center">
							<view class="store-name flex-fill">
								{{ store.name }}
							</view>
							<image src="/static/images/navigator-1.png" class="arrow"></image>
						</view>
					</list-cell>
				</template>
			</view>
			<!-- 购物车列表 begin -->
			<view class="section-2">
				<view class="cart d-flex flex-column">
					<list-cell last v-for="(item, index) in cart" :key="index">
						<view class="w-100 d-flex flex-column">
							<view class="d-flex align-items-center mb-10">
								<view class="name-and-props overflow-hidden">
									<view class="text-color-base font-size-lg">
										{{ item.name }}
									</view>
								</view>
								<view class="d-flex flex-fill justify-content-between align-items-center text-color-base font-size-lg">
									<view>x{{ item.number }}</view>
									<view v-if="!store.hidePrice">￥{{ item.price }}</view>
								</view>
							</view>
							<!-- <view class="text-truncate font-size-base text-color-assist">
								{{ item.props_text }}
							</view> -->
						</view>
					</list-cell>
					<!-- <template v-if="orderType == 'takeout'">
						<list-cell last v-if="store.packing_fee > 0">
							<view class="w-100 d-flex font-size-base align-items-center justify-content-between">
								<view>包装费</view>
								<view>￥{{ parseFloat(store.packing_fee) }}</view>
							</view>
						</list-cell>
						<list-cell last v-if="store.delivery_cost > 0">
							<view class="w-100 d-flex font-size-base align-items-center justify-content-between">
								<view>配送费</view>
								<view>￥{{ parseFloat(store.delivery_cost) }}</view>
							</view>
						</list-cell>
					</template> -->
				</view>
				<list-cell last>
					<view class="flex-fill d-flex justify-content-end align-items-center" v-if="!store.hidePrice">
						<view>总计￥{{ total }},实付</view>
						<view class="font-size-extra-lg font-weight-bold">￥{{ amount }}</view>
					</view>
				</list-cell>
			</view>
			<!-- 购物车列表 end -->
			<view class="d-flex align-items-center justify-content-start font-size-sm text-color-warning" 
				style="padding: 20rpx 0;">
				<view class="iconfont iconhelp line-height-100"></view>
				<view>请填写备注信息</view>
			</view>
			<!-- 桌号 begin -->
			<list-cell arrow last @click="goToSelectDesk" v-if="!isBussiness">
				<view class="d-flex flex-fill align-items-center justify-content-between overflow-hidden">
					<view class="flex-shrink-0 mr-20">桌号</view>
					<view class="flex-fill text-truncate text-right">{{ desk.name }}</view>
				</view>
			</list-cell>
			<list-cell arrow last @click="goToSelectDesk" v-if="isBussiness">
				<view class="d-flex flex-fill align-items-center justify-content-between overflow-hidden">
					<view class="flex-shrink-0 mr-20">桌号</view>
					<view class="text-color-primary flex-fill text-truncate text-right">{{ form.deskName || '点击选择桌号' }}</view>
				</view>
			</list-cell>
			<!-- 桌号 end -->
			<list-cell arrow last  v-if="isBussiness" :hover="false">
				<view class="d-flex flex-fill align-items-center justify-content-between overflow-hidden ">
					<view class="flex-shrink-0 mr-20">人数</view>
					<view class="text-color-primary flex-fill text-truncate text-right cell-left">
						<u-number-box v-model="form.personNum"></u-number-box>
					</view>
				</view>
			</list-cell>
			<!-- 备注 begin -->
			<list-cell arrow last @click="goToRemark">
				<view class="d-flex flex-fill align-items-center justify-content-between overflow-hidden">
					<view class="flex-shrink-0 mr-20">备注</view>
					<view class="text-color-primary flex-fill text-truncate text-right">{{ form.remark || '点击填写备注' }}</view>
				</view>
			</list-cell>
			<!-- 备注 end -->
		</view>
		<!-- 付款栏 begin -->
		<view class="w-100 pay-box position-fixed fixed-bottom d-flex align-items-center justify-content-between bg-white">
			<view class="font-size-sm" style="margin-left: 20rpx;" v-if="!store.hidePrice">合计：</view>
			<view class="font-size-lg flex-fill" v-if="!store.hidePrice">￥{{ amount }}</view>
			<view class="font-size-lg flex-fill" v-if="store.hidePrice"></view>
			<view class="bg-primary h-100 d-flex align-items-center just-content-center text-color-white font-size-base"
				style="padding: 0 60rpx;" @tap="submit">
				确认下单
			</view>
		</view>
		
		<!-- 桌号选择列表 -->
		<u-action-sheet class="desk-select" :round="10" :actions="deskList" :show="showSelectDesk" @close="showSelectDesk = false" @select="selectDesk"></u-action-sheet>
		<u-loading-page :loading="loading"></u-loading-page>
	</view>
</template>

<script>
	import {mapState, mapMutations,mapGetters,mapActions} from 'vuex'
	import listCell from '@/components/list-cell/list-cell'
	import modal from '@/components/modal/modal'
	import { saveOrder } from '@/api/orderApi.js'
	import { findDesk} from '../../api/deskApi.js'
	
	export default {
		components: {
			listCell,
			modal
		},
		data() {
			return {
				loading: false,
				cart: [],
				form: {
					personNum:1,
					remark: '',
					deskId:'',
					deskName:''
				},
				deskList: [],
				showSelectDesk: false,
				ensureAddressModalVisible: false
			}
		},
		computed: {
			...mapState(['orderType', 'address', 'store','desk']),
			...mapGetters(['isBussiness','isLogin']),
			total() {
				return this.cart.reduce((acc, cur) => acc + cur.number * cur.price, 0)
			},
			amount() {
				return this.cart.reduce((acc, cur) => acc + cur.number * cur.price, 0)
			}
		},
		watch:{
			'form.deskId': {
			  immediate: true,
			  deep: true,
			  handler (val) {
			   console.info('form.deskId')
			   console.info(val)
			   uni.setStorageSync('order', this.form)
			  }
			}
		},
		onLoad({remark}) {
			uni.$on('refreshData', () => {
			   this.init()
			})
			if(!this.isLogin) {
				uni.navigateTo({url: '/pages/login/login'})
				return
			}
			this.cart = uni.getStorageSync('cart')
			this.init()
			
		},
		methods: {
			...mapMutations(['SET_ORDER']),
			// ...mapActions(['initBaseData']),
			async init(){// 初始化数据
				const order = uni.getStorageSync('order');
				console.info(order)
				if(order){
					this.form = order;
				}
				// await this.initBaseData()
				if(this.isBussiness){
					this.loading = true
					const repo = await findDesk()
					this.loading = false
					if(repo.code == 200){
						this.deskList = repo.data
					}
				}
			},
			goToSelectDesk(){
				this.showSelectDesk = true
			},
			selectDesk(item){
				this.form.deskId = item.id
				this.form.deskName = item.name
			},
			goToRemark() {
				uni.navigateTo({
					url: '/pages/remark/remark?remark=' + this.form.remark +'&deskId=' + this.form.deskId
				})
			},
			chooseAddress() {
				uni.navigateTo({
					url: '/pages/address/address?is_choose=true&scene=pay'
				})
			},
			goToPackages() {
				uni.navigateTo({
					url: '/pages/packages/index'
				})
			},
			async submit() {
				if(!this.form.deskId && !this.desk.id){
					uni.showToast({
						title: '请选择桌号'
					});
					return
				}
				if(this.form.personNum < 1){
					uni.showToast({
						title: '人数不应少于1个人'
					});
					return
				}
				if(this.desk.id){
					this.form.deskId = this.desk.id
					this.form.deskName = this.desk.name
				}
				uni.showLoading({title: '加载中'})
				uni.removeStorageSync('cart')
				uni.removeStorageSync('order')
				const orderEntity = {
					price: this.amount+"",
					deskId: this.form.deskId,
					deskName: this.form.deskName,
					storeId: this.store.id,
					storeName: this.store.Name,
					remark: this.form.remark,
					personNum: this.form.personNum,
					orderGoods: this.cart.map(item=>{
						return {
							id : item.id,
							name: item.name,
							price : item.price,
							number : item.number
						}
					})
				}
				const repo = await saveOrder(orderEntity);
				if(repo.code == 200){
					uni.reLaunch({
						url: '/pages/orders/orders'
					})
				}
				uni.hideLoading()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 30rpx;
	}
	
	.arrow {
		width: 50rpx; 
		height: 50rpx;
		position: relative;
		margin-right: -10rpx;
	}
	
	.location {
		.store-name {
			font-size: $font-size-lg;
		}
		
		.iconfont {
			font-size: 50rpx;
			line-height: 100%;
			color: $color-primary;
		}
	}
	
	.section-1 {
		margin-bottom: 30rpx;
		.contact {
			.contact-tip {
				margin-left: 10rpx;
				border: 2rpx solid $color-primary;
				padding: 6rpx 10rpx;
				color: $color-primary;
			}
		}
	}
	
	.section-2 {
		.name-and-props {
			width: 65%;
		}
	}
	
	.payment {
		margin-bottom: 30rpx;
		
		.disabled {
			color: $text-color-grey;
		}
		
		.payment-icon {
			font-size: 44rpx; 
			margin-right: 10rpx;
		}
		
		.checkbox {
			font-size: 36rpx;
			margin-left: 10rpx;
		}
		
		.checked {
			color: $color-primary;
		}
	}
	
	.pay-box {
		box-shadow: 0 0 20rpx rgba(0, 0, 0, .1);
		height: 100rpx;
	}
	
	.modal-content {
		.change-address-btn {
			line-height: 2;
			padding: 0 1em;
		}
		.pay_btn {
			width: 100%;
			border-radius: 50rem !important;
			line-height: 3;
		}
	}
	
	.desk-select{
		max-height: 500rpx;
		overflow: auto;
	}
	
	.cell-left{
		position: absolute;
		right: 30rpx;
	}
</style>
