<template>
	<view class="container" v-if="!loading">
		<u-empty
				v-if="!goods.length"
				text="商家暂未上架商品"
		        mode="order"
		        icon="/static/images/common/order.png"
		>
		</u-empty>
		<!-- 头部 -->
		<view class="main" v-if="goods.length && store">
			<view class="header">
				<image class="header-bg" :src="bgImage" mode=""></image>
				<view class="header-top-Placeholder" ></view>
				<view class="container storeInfo hx-shadow">
					<!-- <image class="storeAvatar hx-shadow" :src="bgImage" mode=""></image> -->
					<view class="hx-txt-18 hx-color-black hx-txt-weigth hx-mb-10 ">
						{{ store.name }}
					</view>
					<view class="hx-txt-14 hx-color-black ">
						{{ store.remark }}
					</view>
					<!-- <view class="">
						后续再扩展优惠券，满减，折扣，活动等功能
					</view> -->
					<!-- <view class="shrink-box">
						<i class="hxicon" :class="showStoreBox ? 'icon-fold' : 'icon-unfold'" @click="showStoreBox = !showStoreBox"></i>
					</view> -->
				</view>
			</view>
			<!-- <view class="nav">
				<view class="coupon">
					<u-search placeholder="请输入关键字" v-model="keyword" bgColor="#fff" :showAction="false"></u-search>
				</view>
			</view> -->
			<view class="content">
				<scroll-view class="menus" :scroll-into-view="menuScrollIntoView" scroll-with-animation scroll-y>
					<view class="wrapper">
						<view class="menu" :id="`menu-${item.id}`" :class="{'current': item.id === currentCateId}" v-for="(item, index) in goodsList" 
						:key="index" @tap="handleMenuTap(item.id)">
							<text>{{ item.name }}</text>
							<view class="dot" v-show="menuCartNum(item.id)">{{ menuCartNum(item.id) }}</view>
						</view>
					</view>
				</scroll-view>
				<!-- goods list begin -->
				<scroll-view class="goods" scroll-with-animation scroll-y :scroll-top="cateScrollTop" @scroll="handleGoodsScroll">
					<view class="wrapper">
						<view class="list">
							<!-- category begin -->
							<view class="category" v-for="(item, index) in goodsList" :key="index" :id="`cate-${item.id}`">
								<view class="title">
									<text>{{ item.name }}</text>
									<image :src="item.icon" class="icon"></image>
								</view>
								<view class="items">
									<!-- 商品 begin -->
									<view class="good" v-for="(good, key) in item.goods" :key="key">
										<image :src="fileUrl+good.mainImags" class="image" @tap="showGoodDetailModal(item, good)"></image>
										
										<view class="right">
											<text class="name">{{ good.name }}</text>
											<text class="tips">{{ good.remark }}</text>
											<view class="price_and_action">
												<text class="price" v-if="!store.hidePrice">￥{{ good.price }}</text>
												<view class="btn-group" v-if="good.use_property">
													<button type="primary" class="btn property_btn" hover-class="none"
													 size="mini" @tap="showGoodDetailModal(item, good)">
														选规格
													</button>
													<view class="dot" v-show="goodCartNum(good.id)">{{ goodCartNum(good.id) }}</view>
												</view>
												<view class="btn-group" v-else>
													<button type="default" v-show="goodCartNum(good.id)" plain class="btn reduce_btn"
													 size="small" hover-class="none" @tap="handleReduceFromCart(item, good)">
														<view class="iconfont iconsami-select"></view>
													</button>
													<view class="number" v-show="goodCartNum(good.id)">{{ goodCartNum(good.id) }}</view>
													<button type="primary" class="btn add_btn" size="small" hover-class="none" 
														@tap="handleAddToCart(item, good, 1)">
														<view class="iconfont iconadd-select"></view>
													</button>
												</view>
											</view>
										</view>
									</view>
									<!-- 商品 end -->
								</view>
							</view>
							<!-- category end -->
						</view>
					</view>
				</scroll-view>
				<!-- goods list end -->
			</view>
			<!-- content end -->
			<!-- 购物车栏 begin -->
			<view class="cart-box" v-if="cart.length > 0">
				<view class="mark">
					<image src="/static/images/menu/cart.png" class="cart-img" @tap="openCartPopup"></image>
					<view class="tag">{{ getCartGoodsNumber }}</view>
				</view>
				<view class="price" v-if="!store.hidePrice">￥{{ getCartGoodsPrice }}</view>
				<button type="primary" class="pay-btn" @tap="toPayConfirm" :disabled="disabledPay">
					{{ disabledPay ? `差${spread}元起送` : '去下单' }}
				</button>
			</view>
			<!-- 购物车栏 end -->
		</view>
		<!-- 商品详情模态框 begin -->
		<modal :show="goodDetailModalVisible" class="good-detail-modal" color="#5A5B5C" 
				width="90%" custom padding="0rpx" radius="12rpx">
			<view class="cover">
				<image v-if="good.mainImags" :src="fileUrl+good.mainImags" class="image"></image>
				<view class="btn-group">
					<image src="/static/images/menu/share-good.png"></image>
					<image src="/static/images/menu/close.png" @tap="closeGoodDetailModal"></image>
				</view>
			</view>
			<scroll-view class="detail" scroll-y>
				<view class="wrapper">
					<view class="basic">
						<view class="name">{{ good.name }}</view>
						<view class="tips">{{ good.content }}</view>
					</view>
					<view class="properties" v-if="good.use_property">
						<view class="property" v-for="(item, index) in good.property" :key="index">
							<view class="title">
								<text class="name">{{ item.name }}</text>
								<view class="desc" v-if="item.desc">({{ item.desc }})</view>
							</view>
							<view class="values">
								<view class="value" v-for="(value, key) in item.values" :key="key" 
								:class="{'default': value.is_default}" 
								@tap="changePropertyDefault(index, key)">
									{{ value.value }}
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			<view class="action">
				<view class="left">
					<view class="price" >￥{{ good.price }}</view>
					<view class="props" v-if="getGoodSelectedProps(good)">
						{{ getGoodSelectedProps(good) }}
					</view>
				</view>
				<view class="btn-group">
					<button type="default" plain class="btn" size="mini" hover-class="none" 
						@tap="handlePropertyReduce">
						<view class="iconfont iconsami-select"></view>
					</button>
					<view class="number">{{ good.number }}</view>
					<button type="primary" class="btn" size="min" hover-class="none" 
						@tap="handlePropertyAdd">
						<view class="iconfont iconadd-select"></view>
					</button>
				</view>
			</view>
			<view class="add-to-cart-btn" @tap="handleAddToCartInModal">
				<view>加入购物车</view>
			</view>
		</modal>
		<!-- 商品详情模态框 end -->
		<!-- 购物车详情popup -->
		<popup-layer direction="top" :show-pop="cartPopupVisible" class="cart-popup">
			<template slot="content">
				<view class="top">
					<text @tap="handleCartClear">清空</text>
				</view>
				<scroll-view class="cart-list" scroll-y>
					<view class="wrapper">
						<view class="item" v-for="(item, index) in cart" :key="index">
							<view class="left">
								<view class="name">{{ item.name }}</view>
								<view class="props">{{ item.remark }}</view>
							</view>
							<view class="center">
								<text>￥{{ item.price }}</text>
							</view>
							<view class="right">
								<button type="default" plain size="mini" class="btn" hover-class="none"
									@tap="handleCartItemReduce(index)">
									<view class="iconfont iconsami-select"></view>
								</button>
								<view class="number">{{ item.number }}</view>
								<button type="primary" class="btn" size="min" hover-class="none"
									@tap="handleCartItemAdd(index)">
									<view class="iconfont iconadd-select"></view>
								</button>
							</view>
						</view>
						<view class="item" v-if="orderType == 'takeout' && store.packing_fee">
							<view class="left">
								<view class="name">包装费</view>
							</view>
							<view class="center">
								<text>￥{{ parseFloat(store.packing_fee) }}</text>
							</view>
							<view class="right invisible">
								<button type="default" plain size="mini" class="btn" hover-class="none">
									<view class="iconfont iconsami-select"></view>
								</button>
								<view class="number">1</view>
								<button type="primary" class="btn" size="min" hover-class="none">
									<view class="iconfont iconadd-select"></view>
								</button>
							</view>
						</view>
					</view>
				</scroll-view>
			</template>
		</popup-layer>
		<!-- 购物车详情popup -->
	</view>
	<view class="loading" v-else>
		<image src="/static/images/loading.gif"></image>
	</view>
</template>

<script>
import modal from '@/components/modal/modal'
import popupLayer from '@/components/popup-layer/popup-layer'
import {mapState, mapMutations, mapActions, mapGetters} from 'vuex'
import {findGoodsGroups} from '@/api/goodsApi.js'
import {getDesk} from '@/api/deskApi.js'
export default {
	components: {
		modal,
		popupLayer
	},
	data() {
		return {
			deskInfo:{}, //桌号信息
			fileUrl:this.$config.fileUrl,
			goods: [], //所有商品
			loading: true,
			currentCateId: 6905,//默认分类
			cateScrollTop: 0,
			menuScrollIntoView: '',
			cart: [], //购物车
			goodDetailModalVisible: false, //是否食品详情模态框
			good: {}, //当前食品
			category: {}, //当前食品所在分类
			cartPopupVisible: false,
			sizeCalcState: false,
			keyword:''
		}
	},
	onLoad(query) {
		console.info("menu on show")
		if(query && query.q){ //扫码点餐
			const q = decodeURIComponent(query.q) // 获取到二维码原始链接内容
			let reg =/(\w+)$/;
			const deskId = reg.exec(q)[0]
			uni.setStorageSync('deskId', deskId)
		}
		uni.$on('refreshData', () => {
		     this.init()
		})
		this.init()
		// uni.startPullDownRefresh();
	},
	onPullDownRefresh() {
	    this.init()
		uni.stopPullDownRefresh()
	},
	computed: {
		...mapState(['orderType', 'address', 'store']),
		...mapGetters(['isLogin']),
		bgImage(){
			return this.$config.fileUrl + this.store.avatarPath
		},
		goodsList(){
			return this.goods.map(item=>{
				const group = Object.assign({}, item);
				group.goods = group.goods.filter(item=>{
					return !this.keyword || item.name.indexOf(this.keyword) >= 0;
				})
				return group;
			}).filter(group=>{
				return group.goods.length;
			})
		},
		goodCartNum() {	//计算单个食品添加到购物车的数量
			return (id) => this.cart.reduce((acc, cur) => {
					if(cur.id === id) {
						return acc += cur.number
					}
					return acc
				}, 0)
		},
		menuCartNum() {
			return (id) => this.cart.reduce((acc, cur) => {
					if(cur.cate_id === id) {
						return acc += cur.number
					}
					return acc
			}, 0)
		},
		getCartGoodsNumber() { //计算购物车总数
			return this.cart.reduce((acc, cur) => acc + cur.number, 0)
		},
		getCartGoodsPrice() {	//计算购物车总价
			return this.cart.reduce((acc, cur) => acc + cur.number * cur.price, 0)
		},
		disabledPay() { //是否达到起送价
			return this.orderType == 'takeout' && (this.getCartGoodsPrice < this.store.min_price) ? true : false
		},
		spread() { //差多少元起送
			if(this.orderType != 'takeout') return
			return parseFloat((this.store.min_price - this.getCartGoodsPrice).toFixed(2))
		}
	},
	methods: {
		...mapMutations(['SET_ORDER_TYPE']),
		async init() {	//页面初始化
			this.loading = true
			await this.loginInit()
			// 初始化基础数据
			if(!this.store.id){
				uni.navigateTo({
					url: '/pages/menu/empty'
				})
				return
			}
			const repo = await findGoodsGroups({"status":"on","storeId":this.store.id})
			if (repo.code == 200) {
				this.goods = repo.data;
				this.currentCateId = this.goods.length ? this.goods[0].id:''
			} else {
				this.goods = []
			}
			this.loading = false
			this.cart = uni.getStorageSync('cart') || []
			
		},
		handleMenuTap(id) {	//点击菜单项事件
		    this.currentCateId = id
			if(!this.sizeCalcState) {
				this.calcSize()
			}
			
			this.$nextTick(() => this.cateScrollTop = this.goods.find(item => item.id == id).top)
		},
		handleGoodsScroll({detail}) {	//商品列表滚动事件
			if(!this.sizeCalcState) {
				this.calcSize()
			}
			const {scrollTop} = detail
			let tabs = this.goods.filter(item=> item.top <= scrollTop+10).reverse()
			if(tabs.length > 0){
				this.currentCateId = tabs[0].id
			}
		},
		calcSize() {
			let h = 4
			this.goods.forEach(item => {
				let view = uni.createSelectorQuery().select(`#cate-${item.id}`)
				view.fields({
					size: true
				}, data => {
					item.top = h
					h += data.height
					item.bottom = h
				}).exec()
			})
			this.sizeCalcState = true
		},
		handleAddToCart(cate, good, num) {	//添加到购物车
			const index = this.cart.findIndex(item => {
				if(good.use_property) {
					return (item.id === good.id) && (item.props_text === good.props_text)
				} else {
					return item.id === good.id
				}
			})
			if(index > -1) {
				this.cart[index].number += num
			} else {
				this.cart.push({
					id: good.id,
					name: good.name,
					price: good.price,
					number: num
				})
			}
		},
		handleReduceFromCart(item, good) {
			const index = this.cart.findIndex(item => item.id === good.id)
			this.cart[index].number -= 1
			if(this.cart[index].number <= 0) {
				this.cart.splice(index, 1)
			}
		},
		showGoodDetailModal(item, good) {
			this.good = JSON.parse(JSON.stringify({...good, number: 1}))
			this.category = JSON.parse(JSON.stringify(item))
			this.goodDetailModalVisible = true
		},
		closeGoodDetailModal() { //关闭食品详情模态框
			this.goodDetailModalVisible = false
			this.category = {}
			this.good = {}
		},
		changePropertyDefault(index, key) { //改变默认属性值
			this.good.property[index].values.forEach(value => this.$set(value, 'is_default', 0))
			this.good.property[index].values[key].is_default = 1
			this.good.number = 1
		},
		getGoodSelectedProps(good, type = 'text') {	//计算当前食品所选属性
			if(good.use_property) {
				let props = []
				good.property.forEach(({values}) => {
					values.forEach(value => {
						if(value.is_default) {
							props.push(type === 'text' ? value.value : value.id)
						}
					})
				})
				return type === 'text' ? props.join('，') : props
			}
			return ''
		},
		handlePropertyAdd() {
			this.good.number += 1
		},
		handlePropertyReduce() {
			if(this.good.number === 1) return
			this.good.number -= 1
		},
		handleAddToCartInModal() {
			const product = Object.assign({}, this.good, {props_text: this.getGoodSelectedProps(this.good), props: this.getGoodSelectedProps(this.good, 'id')})
			this.handleAddToCart(this.category, product, this.good.number)
			this.closeGoodDetailModal()
		},
		openCartPopup() {	//打开/关闭购物车列表popup
			this.cartPopupVisible = !this.cartPopupVisible
		},
		handleCartClear() {	//清空购物车
			uni.showModal({
				title: '提示',
				content: '确定清空购物车么',
				success: ({confirm}) =>  {
					if(confirm) {
						this.cartPopupVisible = false
						this.cart = []
					}
				}
			})
		},
		handleCartItemAdd(index) {
			this.cart[index].number += 1
		},
		handleCartItemReduce(index) {
			if(this.cart[index].number === 1) {
				this.cart.splice(index, 1)
			} else {
				this.cart[index].number -= 1
			}
			if(!this.cart.length) {
				this.cartPopupVisible = false
			}
		},
		toPayConfirm() {
			uni.showLoading({title: '加载中'})
			uni.setStorageSync('cart', JSON.parse(JSON.stringify(this.cart)))
			
			uni.navigateTo({
				url: '/pages/pay/confirm'
			})
			uni.hideLoading()
		}
	}
};
</script>

<style lang="scss" scoped>
	@import '~@/pages/menu/menu.scss';
	.bg {
		width: 100%;
		height: calc(410 / 594 * 400rpx);
	}
	.header-relative {
		position: relative;
		border-radius: 8rpx; 
		margin-bottom: 30rpx;
		margin-top: -115rpx;
		box-shadow: $box-shadow;
	}
</style>
