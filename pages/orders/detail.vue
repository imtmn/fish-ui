<template>
	<view class="container" style="padding:20rpx;">
		<view style="padding-bottom: 100rpx;">
			<view class="bg-white">
				<view class="section">
					<!-- store info begin -->
					<!-- <list-cell :hover="false">
						<view class="w-100 d-flex align-items-center">
							<view class="d-flex flex-column w-60">
								<view class="w-100 font-size-lg text-color-base text-truncate mb-10">{{ order.name }}</view>
								<view class="w-100 d-flex align-items-center overflow-hidden">
									<image src="/static/images/order/location.png" class="flex-shrink-0" style="width: 30rpx; height: 30rpx;"></image>
									<view class="text-truncate font-size-sm text-color-assist">{{ order.address }}</view>
								</view>
							</view>
							<view class="d-flex justify-content-end align-items-center w-40">
								<image src="/static/images/order/mobile.png" style="width: 60rpx; height: 60rpx;margin-right: 30rpx;"></image>
								<image src="/static/images/order/navigation.png" style="width: 60rpx; height: 60rpx;"></image>
							</view>
						</view>
					</list-cell> -->
					<!-- store info end -->
					<!-- goods begin -->
					<list-cell :hover="false" padding="50rpx 30rpx">
						<view class="w-100 d-flex flex-column position-relative" style="margin-bottom: -40rpx;">
							<view class="w-100 d-flex align-items-center mb-40" v-for="(good, index) in order.orderGoods" :key="index">
								<view class="d-flex flex-column w-60 overflow-hidden">
									<view class="font-size-lg text-color-base mb-10 text-truncate">{{ good.name }}</view>
									<!-- <view class="font-size-sm text-color-assist text-truncate">{{ good.property }}</view> -->
								</view>
								<view class="d-flex w-40 align-items-center justify-content-between pl-30">
									<view class="font-size-base text-color-base">x{{ good.number }}</view>
									<view class="font-size-base text-color-base font-weight-bold">￥{{ good.price }}</view>
								</view>
							</view>
						</view>
					</list-cell>
					<!-- goods end -->
				</view>
				<view class="section">
					<!-- payment and amount begin -->
					<list-cell :hover="false" padding="50rpx 30rpx">
						<view class="w-100 d-flex flex-column">
							<!-- <view class="pay-cell">
								<view>支付方式</view>
								<view class="font-weight-bold">{{ order.pay_mode }}</view>
							</view> -->
							<view class="pay-cell">
								<view>金额总计</view>
								<view class="font-weight-bold">￥{{ order.price }}</view>
							</view>
							<view v-if="isBussiness" class="pay-cell" v-show="order.payPrice > 0">
								<view>实付金额</view>
								<view class="font-weight-bold">￥{{ order.payPrice }}</view>
							</view>
						</view>
					</list-cell>
					<!-- payment and amount end -->
				</view>
				<view class="section">
					<!-- order info begin -->
					<list-cell :hover="false" padding="50rpx 30rpx">
						<view class="w-100 d-flex flex-column">
							<view class="pay-cell">
								<view>桌号</view>
								<view class="font-weight-bold">{{ order.deskName }}</view>
							</view> 
							<view class="pay-cell">
								<view>人数</view>
								<view class="font-weight-bold">{{ order.personNum }}</view>
							</view> 
							<view class="pay-cell">
								<view>下单时间</view>
								<view class="font-weight-bold">{{ $util.formatDateTime(order.createTime) }}</view>
							</view>
							 
							<!-- <view class="pay-cell">
								<view>支付方式</view>
								<view class="font-weight-bold">{{ order.pay_mode }}</view>
							</view> -->
							<view class="pay-cell">
								<view>订单号</view>
								<view class="font-weight-bold">{{ order.id }}</view>
							</view>
							<view class="pay-cell">
								<view>备注</view>
									<view class="font-weight-bold" >
								{{ order.remark }}
								</view>
							</view>
							<view class="pay-cell" v-if="isBussiness">
								<view>状态</view>
								<!-- <view class="font-weight-bold" :style="getStatusColor(order.status)"> -->
									<view class="font-weight-bold" >
								{{ getStatus(order.status) }}
								</view>
							</view>
						</view>
					</list-cell>
					<!-- order info end -->
				</view>
				<!-- order other info begin -->
				<!-- <list-cell :hover="false" padding="50rpx 30rpx 20rpx" last>
					<view class="w-100 d-flex flex-column">
						<view class="pay-cell">
							<view>取单号</view>
							<view class="font-weight-bold">{{ order.sort_num }}</view>
						</view>
						<view class="pay-cell">
							<view>享用方式</view>
							<view class="font-weight-bold">自取</view>
						</view>
						<view class="pay-cell">
							<view>取餐时间</view>
							<view class="font-weight-bold">立即取餐</view>
						</view>
						<view class="pay-cell">
							<view>完成制作时间</view>
							<view class="font-weight-bold">{{ order.productioned_time }}</view>
						</view>
						<view class="pay-cell">
							<view>备注</view>
							<view class="font-weight-bold">{{ order.postscript }}</view>
						</view>
					</view>
				</list-cell> -->
				<!-- order other info end -->
			</view>
		<!-- 	<view class="position-relative w-100">
				<image src="/static/images/order/bottom.png" mode="widthFix" class="w-100"></image>
				<view class="invote-box" v-if="!order.invoice_status">
					<view class="font-size-base text-color-primary" @tap="goToInvoice">去开发票</view>
					<image src="/static/images/order/right.png"></image>
				</view>
			</view> -->
		</view>
		 <view class="btn-box" v-if="order.status == 'normal' && isBussiness">
			<!-- <view class="item"><button type="primary" plain @tap="review">去评价</button></view> -->
			<view class="item"><button type="primary" v-if="order.status == 'normal'" @tap.stop="showPayModel()">结算</button></view>
		</view> 
		<u-popup :show="isShowPayModel" @close="closePayModel()" :round="10" >
		    <view class="u-block">
				<text class="u-demo-block__title">实际付款金额</text>
		        <view class="u-demo-block__content">
		        	<u--input
						:maxlength="8"
						type="number"
		        		placeholder="实际付款金额"
		        		border="surround"
		        		v-model="payPrice"
		        	></u--input>
		        </view>
		    	<view class="u-demo-block__content" style="padding-top: 15px; flex-direction: column;align-items: stretch;flex-wrap: nowrap;" >
		    		<u-button
		    			@click="pay()"
		    		    text="确认结算"
		    		    type="error"
		    		></u-button>
		    	</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import {getOrder, payOrder} from '@/api/orderApi';
import listCell from '@/components/list-cell/list-cell';
import { getOrderStatusName, getOrderStatusColor } from './orderStatus.js'
import { mapGetters } from 'vuex'
export default {
	components: {
		listCell
	},
	data() {
		return {
			isShowPayModel: false,
			payPrice: 0,
 			order: {}
		};
	},
	computed: {
		...mapGetters(['isBussiness'])
	},
	async onLoad({ id }) {
		await this.query(id)
	},
	methods: {
		async query(id){
			const repo = await getOrder(id);
			if(repo.code == 200){
				this.order = repo.data
			}
		},
		// 确认结算
		async pay(){
			const repo = await payOrder({
				"id": this.order.id,
				"payPrice": this.payPrice
			});
			if(repo.code == 200){
				this.isShowPayModel = false
				uni.$emit('refreshData');
				uni.navigateBack({
					delta: 1
				})
				// this.query(this.order.id)
			}
		},
		closePayModel(){
			this.isShowPayModel = false
		},
		showPayModel(){
			this.payPrice = this.order.price
			this.isShowPayModel = true
		},
		getStatusColor(status){
			const color = getOrderStatusColor(status)
			return {
				color: color
			}
		},
		getStatus(status){
			return getOrderStatusName(status)
		},
		review() {
			const date = this.order.completed_time.split(' ')[0]
			uni.navigateTo({
				url: '/pages/review/review?storename=' + this.order.store.name + '&typeCate=' + this.order.typeCate + '&date=' + date
			})
		},
		goToInvoice() {
			uni.navigateTo({
				url: '/pages/invoice/invoice'
			})
		}
	}
};
</script>

<style lang="scss" >
	@import '~@/pages/orders/orders.scss';
</style>
