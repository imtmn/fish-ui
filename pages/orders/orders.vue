<template>
	<view class="container">
		<u-empty
				v-if="!orders.length"
				text="订单为空"
		        mode="order"
		        icon="/static/images/common/order.png"
		>
		</u-empty>
		<view style="background-color: #fff;margin: 20rpx; margin-bottom: 0;" v-if="isBussiness && orders.length">
			<u-tabs :list="statusTabs" @click="changeTabs"></u-tabs>
		</view>
		<view class="orders-list d-flex flex-column w-100" style="padding: 20rpx; padding-bottom: 0;">
			<view class="order-item" v-for="(item, index) in orders" :key="index" style="margin-bottom: 30rpx;" @tap="detail(item.id)">
				<list-cell :hover="false">
					<view class="w-100 d-flex align-items-center">
						<view class="flex-fill d-flex flex-column">
							<view class="font-size-lg text-color-base" style="margin-bottom: 20rpx;">
								 {{ item.deskName }} 
								 <span v-if="item.personNum" style="margin-left: 30rpx;"> {{item.personNum}}人 </span>
							</view>
							<view class="font-size-sm text-color-assist">订单编号：{{ item.id }}</view>
						</view>
						<view class="font-size-lg" v-if="isBussiness">
							<!-- <view class="font-size-lg" :style="getStatusColor(item.status)"> -->
							{{ getStatus(item.status) }}
						</view>
					</view>
				</list-cell>
				<list-cell :hover="false" last>
					<view class="w-100 d-flex flex-column">
						<view class="w-100 text-truncate font-size-lg text-color-base" style="margin-bottom: 20rpx;">
							{{ orderGoodsName(item.orderGoods) }}
						</view>
						<view class="d-flex justify-content-between align-items-center" style="margin-bottom: 30rpx;">
							<view class="font-size-sm text-color-assist">
								{{ $util.formatDateTime(item.createTime) }}
							</view>
							<view class="d-flex font-size-sm text-color-base align-items-center">
								<view style="margin-right: 10rpx;" v-if="!store.hidePrice">共{{ item.orderGoods.length }}件商品，总价：</view>
								<view class="font-size-lg" v-if="!store.hidePrice">￥{{ item.price }}</view>
							</view>
						</view>
						<view class="d-flex justify-content-between align-items-center" style="margin-bottom: 30rpx;" v-show="item.remark">
							<view class="d-flex font-size-sm text-color-base align-items-center">
								<view style="margin-right: 10rpx;">备注：{{ item.remark }}</view>
							</view>
						</view>
						<view class="d-flex align-items-center justify-content-end" v-show="isBussiness">
							<view style="margin-right: 10rpx;">
								<button type="primary" plain size="mini" v-if="item.status == 'normal'" @click.stop="openModel(item,'取消')">取消订单</button>
								<button type="primary" plain size="mini" v-if="item.status == 'cancel'" @click.stop="openModel(item,'恢复')">恢复订单</button>
							</view>
							<view style="margin-right: 10rpx;">
								<button type="primary" plain size="mini"  @tap.stop="printOrder(item)">打印</button>
							</view>
							<view>
								<button type="primary" plain size="mini" v-if="item.status == 'normal'" @tap.stop="detail(item.id)">结算</button>
							</view>
						</view>
					</view>
				</list-cell>
			</view>
			<u-divider text="已到底部" style="padding-bottom: 50px;" v-show="orders.length && orders.length >= 5"></u-divider>
		</view>
		
		<u-modal :show="showModel" :showCancelButton="true" @cancel="colseModel" @confirm="confirmModel"
				  :content="modelMsg" confirmColor="#fa3534"></u-modal>
				  
	<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	var tsc = require("../../util/ble/tsc.js");
	var esc = require("../../util/ble/esc.js");
	var encode = require("../../util/ble/encoding.js");
	import listCell from '@/components/list-cell/list-cell'
	import { findOrderPage,cancelOrder,recoverOrder } from '@/api/orderApi.js'
	import { getOrderStatusName,getOrderStatusColor } from './orderStatus.js'
	import { mapState,mapActions,mapGetters } from 'vuex';
	export default {
		components: {
			listCell
		},
		data() {
			return {
				statusTabs:[
					{name: '全部'},
					{name: '待支付', value:"normal"},
					{name: '已支付', value:"pay"},
					// {name: '已完成', value:"complete"},
					{name: '已取消', value:"cancel"},
					],
				params:{
					page: 1,
					pageSize: 5,
					status: ''
				},
				orders: [],
				selectedOrder: {},
				operation: '',
				showModel: false,
				modelMsg:'',
				total: 0,
				oneTimeData: 0,
				buffSize: [],
				buffIndex: 0,
				printNum: [],
				printNumIndex: 0,
				printerNum: 1,
				currentPrint: 1,
				isReceiptSend: false,
				isLabelSend: false
			}
		},
		onReady(){
			let list = []
			let numList = []
			let j = 0
			for (let i = 20; i < 200; i += 10) {
			  list[j] = i;
			  j++
			}
			for (let i = 1; i < 10; i++) {
			  numList[i - 1] = i
			}
			this.buffSize = list;
			this.oneTimeData = list[0];
			this.printNum = numList;
			this.printerNum = numList[0];
		},
		computed: {
			...mapState(['sysinfo', 'Bluetooth','store']),
			...mapGetters(['isBussiness','isLogin']),
			orderGoodsName() {
				return (goods) => {
					let arr = []
					goods.forEach(good => arr.push(good.name + '*' + good.number))
					return arr.join('，')
				}
			}
		},
		onLoad() {
			uni.$on('refreshData', () => {
				this.init()
			})
			if(!this.isLogin) {
				uni.navigateTo({
					url: '/pages/login/login'
				})
				return
			}
			// uni.startPullDownRefresh();
			this.init()
			
		},
		async onPullDownRefresh() {
		    await this.getOrders(false)
			uni.stopPullDownRefresh()
		},
		async onReachBottom() {
			if (this.page * this.pageSize <= this.total) {
				this.page += 1
				await this.getOrders(true)
			}else {
				console.info("已经加载所有数据")
			}
			
		},
		methods: {
			// ...mapActions(['initBaseData']),
			async init(){
				this.loginInit()
				// await this.initBaseData()
				this.getOrders(false)
			},
			// 打印订单
			printOrder(order){
				var canvasWidth = this.canvasWidth
				var canvasHeight = this.canvasHeight
				var command = esc.jpPrinter.createNew()
				command.init()
				// 标题
				command.bold(1);//加粗
				command.setFontSize(16);//字体大小
				command.setSelectJustification(1)//居中
				command.rowSpace(30);
				command.setText("1号桌订单");
				command.setPrint();
				command.rowSpace(10);
				
				command.bold(0);//取消加粗
				command.setFontSize(0);//正常字体
				//时间
				command.setSelectJustification(0);//居左
				command.setText("时间："+ this.$util.formatDateTime(order.createTime));
				command.setPrint();
				//编号
				command.setSelectJustification(0);//居左
				command.setText("编号：" + order.id);
				command.setPrintAndFeed(80);//打印并走纸feed个单位
				command.rowSpace(30);//间距
				command.setPrint();
				//列表
				// command.rowSpace(80);//间距
				command.rowSpace(20);
				command.bold(5);//加粗
				command.setText("商品");
				command.setAbsolutePrintPosition(150);
				command.setText("数量");
				command.setAbsolutePrintPosition(250);
				command.setText("金额");
				command.setPrint()
				command.bold(0);//加粗
				
				// -------1
				order.orderGoods.forEach(item=>{
					command.rowSpace(15);
					command.setText(item.name);
					command.setAbsolutePrintPosition(150);
					command.setText("X"+ item.number);
					command.setAbsolutePrintPosition(250);
					command.setText(item.price);
					command.setPrint();
				})
				
				command.rowSpace(30);
				//合计
				command.bold(5);//加粗
				command.setAbsolutePrintPosition(80);
				command.setText("总数：" +  order.orderGoods.length);
				command.setAbsolutePrintPosition(180);
				command.setText("合计：" + order.price);
				command.setPrint();
				command.rowSpace(10);
				//提示
				// command.rowSpace(80);//间距
				// command.bold(2);//加粗
				// command.setSelectJustification(1);//居中
				// command.setText("售出商品购买后7天内,可凭小票退换");
				// command.setPrint();
				// command.setText("(注：吊牌未拆剪,商品未洗涤)");
				// command.setPrint();
							
				//电话
				command.setSelectJustification(0);//居左
				command.setText("订餐热线:5313718");
				command.setPrint();
				command.setText("联系地址:安厚四中路口永福大排档");
				command.setPrint();
							
				command.setPrintAndFeedRow(3);
				
				this.isReceiptSend = true;
				this.prepareSend(command.getData());
			},
			//准备发送，根据每次发送字节数来处理分包数量
			prepareSend(buff){
				console.log(buff);
				let time = this.oneTimeData
				let looptime = parseInt(buff.length / time);
				let lastData = parseInt(buff.length % time);
				console.log(looptime + "---" + lastData)
				this.looptime = looptime + 1;
				this.lastData = lastData;
				this.currentTime = 1;
				this.send(buff)
			},
			//查询打印机状态
			queryStatus(){
				let command = esc.jpPrinter.Query();
				command.getRealtimeStatusTransmission(1);
			},
			//分包发送
			send(buff){
				let that = this
				let {currentTime,looptime:loopTime,lastData,oneTimeData:onTimeData,printerNum:printNum,currentPrint}=that;
				let buf;
				let dataView;
				if (currentTime < loopTime) {
				  buf = new ArrayBuffer(onTimeData)
				  dataView = new DataView(buf)
				  for (var i = 0; i < onTimeData; ++i) {
					dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
				  }
				} else {
				  buf = new ArrayBuffer(lastData)
				  dataView = new DataView(buf)
				  for (var i = 0; i < lastData; ++i) {
					dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
				  }
				}
				console.log("第" + currentTime + "次发送数据大小为：" + buf.byteLength)
				let {
					BLEInformation
				} = getApp().globalData.Bluetooth;
				
				uni.writeBLECharacteristicValue({
				  deviceId: BLEInformation.deviceId,
				  serviceId: BLEInformation.writeServiceId,
				  characteristicId: BLEInformation.writeCharaterId,
				  value: buf,
				  success: function(res) {
					console.log(res)
				  },
				  fail: function(e) {
					console.log(e)
				  },
				  complete: function() {
					currentTime++
					if (currentTime <= loopTime) {
					  that.currentTime = currentTime;
					  that.send(buff)
					} else {
					  uni.showToast({
						title: '已打印第' + currentPrint + '张',
					  })
					  if (currentPrint == printNum) {
						that.looptime = 0;
						that.lastData = 0;
						that.currentTime = 1;
						that.isReceiptSend = false;
						that.isLabelSend = false;
						that.currentPrint = 1;
					  } else {
						currentPrint++;
						that.currentPrint = currentPrint;
						that.currentTime = 1;
						that.Send(buff)
					  }
					}
				  }
				})
			},
			resetQuery(){
				this.params.page = 1;
				this.params.pageSize = 5;
				this.getOrders()
			},
			async getOrders(isRefresh = false) {
				uni.showLoading({
					title: '加载中'
				})
				if (!isRefresh) {
					let repo = await findOrderPage(this.params)
					// let orders = await this.$api('orders')
					if(repo.code == 200){
						this.orders = repo.data;
						this.total = repo.total
					}
				} else {
					let repo = await findOrderPage(this.params)
					// let orders = await this.$api('orders')
					if(repo.code == 200){
						this.orders = this.orders.concat(repo.data)
						this.total = repo.total
					}
				}
				uni.hideLoading()
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
			changeTabs(tab){
				this.params.status = tab.value;
				if(!this.params.status){
					delete this.params.status
				}
				this.resetQuery();
			},
			detail(id) {
				uni.navigateTo({
					url: '/pages/orders/detail?id=' + id
				})
			},
			goToInvoice() {
				uni.navigateTo({
					url: '/pages/invoice/invoice'
				})
			},
			openModel(order, operation){
				this.selectedOrder = order
				this.operation = operation
				this.modelMsg = '请确认是否'+operation+'['+order.id+']订单？'
				this.showModel = true
			},
			colseModel(){
				this.showModel = false
				this.selectedOrder = {}
			},
			async confirmModel(){
				this.showModel = false
				let repo;
				if (this.operation == '恢复') {
					repo = await recoverOrder(this.selectedOrder.id);
				} else {
					repo = await cancelOrder(this.selectedOrder.id);
				}
				if (repo.code == 200) {
					this.resetQuery()
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>
