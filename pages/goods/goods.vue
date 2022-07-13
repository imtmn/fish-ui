<template>
	<view class="container u-page" v-if="!loading">
		<view class="main" >
			<view class="nav">
				<view class="header">
					<view class="left">
						<view class="add_btn">
							<u-button text="添加菜品" type="error" size="small" @click="toAddView()"></u-button>
						</view>
					</view>
					<view class="right" >
						<u-subsection class="status_tab" mode="subsection" activeColor="#f56c6c"  
						:list="tabList" :current="tabIndex"  @change="changeTab"></u-subsection>
					</view>
				</view>
			</view>
			
			<view class="content" v-if="goods.length">
				<scroll-view class="menus" :scroll-into-view="menuScrollIntoView" scroll-with-animation scroll-y>
					<view class="wrapper">
						<view class="menu" :id="`menu-${item.id}`" :class="{'current': item.id === currentCateId}" v-for="(item, index) in goods" 
						:key="index" @tap="handleMenuTap(item.id)">
							<text>{{ item.name }}</text>
						</view>
						<u-action-sheet :show="typeActionshow" :closeOnClickOverlay="true" cancelText="取消"
										@close="typeActionshow = false"></u-action-sheet>
					</view>
				</scroll-view>
				<!-- goods list begin -->
				<scroll-view class="goods" scroll-with-animation scroll-y :scroll-top="cateScrollTop" @scroll="handleGoodsScroll">
					<view class="wrapper">
						<view class="list" >
							<!-- category begin -->
							<view class="category" v-for="(item, index) in goods" :key="index" :id="`cate-${item.id}`">
								<view class="title">
									<text>{{ item.name }}</text>
									<image :src="item.icon" class="icon"></image>
								</view>
								<view class="items">
									<!-- 商品 begin -->
									<view class="good" v-for="(good, key) in item.goods" :key="key">
										<image :src="fileUrl+good.mainImags" class="image" @tap="showGoodDetailModal(item, good)"></image>
										<view class="right">
											
											<view class="price_and_action">
												<view style="display: flex;flex-direction: column;">
													<text class="name">{{ good.name }}</text>
													<text class="tips">{{ good.remark }}</text>
													<text class="price">￥{{ good.price }}</text>
												</view>
												
												
											</view>
										</view>
										<view class="flex-center">
											<u-button class="btn mg-10" :text="statusText" type="error" size="small"  @click="confirmSatausModel(good)"></u-button>
											<u-button class="btn mg-10" text="编辑" type="error" size="small" @click="toAddView(good)" ></u-button>
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
			<view  v-else>
				<u-empty
				        mode="list"
				        icon="http://cdn.uviewui.com/uview/empty/list.png"
				>
				</u-empty>
			</view>
			<!-- content end -->
			
		</view>
		<u-modal :show="statusModelShow" :showCancelButton="true" @cancel="colseStatusModelShow" @confirm="changeStatus"
						  :content="'请确认是否'+statusText+'['+currentGoods.name+']？'" confirmColor="#fa3534"></u-modal>
	</view>
	<view class="loading" v-else>
		<image src="/static/images/loading.gif"></image>
	</view>
</template>

<script>
// import modal from '@/components/modal/modal'
// import popupLayer from '@/components/popup-layer/popup-layer'
import {mapState, mapMutations, mapActions, mapGetters} from 'vuex'
import {findGoodsGroups,goodsStatusOff,goodsStatusOn} from '@/api/goodsApi.js'

export default {
	components: {
		// modal,
		// popupLayer
	},
	data() {
		return {
			fileUrl:this.$config.fileUrl,
			tabList: ['上架中', '已下架'],
			tabIndex:0,
			typeActionshow:false,
			goods: [], //所有商品
			loading: false,
			currentCateId: '',//默认分类
			cateScrollTop: 0,
			menuScrollIntoView: '',
			goodDetailModalVisible: false, //是否饮品详情模态框
			good: {}, //当前饮品
			category: {}, //当前所在分类
			sizeCalcState: false,
			showTypePopup:false,
			// 上架、下架 模态框是否显示
			statusModelShow:false,
			// 当前选择商品
			currentGoods: {}
		}
	},
	async onLoad() {
		await this.init()
		 uni.$on('refreshData', () => {
		      this.init()
		 })
	},
	computed: {
		...mapState(['orderType', 'address', 'store']),
		...mapGetters(['isLogin']),
		statusText(){
			return this.tabIndex == 0 ? '下架':'上架'
		}
	},
	methods: {
		...mapMutations(['SET_ORDER_TYPE']),
		...mapActions(['getStore']),
		async init() {	//页面初始化
			const repo = await findGoodsGroups({"status":this.tabIndex == 0 ? "on":"off"})
			if(repo.code == 200){
				this.goods = repo.data;
				this.currentCateId = this.goods.length ? this.goods[0].id:''
			}
		},
		// 修改顶部状态选择
		async changeTab(index){
			this.tabIndex = index;
			if(index == 1){
				// 已下架
				const repo = await findGoodsGroups({"status":"off"})
				if(repo.code == 200){
					this.goods = repo.data;
				}
			}else{
				// 已上架
				const repo = await findGoodsGroups({"status":"on"})
				if(repo.code == 200){
					this.goods = repo.data;
				}
			}
		},
		toAddView(goods){
			if(goods){
				getApp().globalData.goods = goods
			}else{
				getApp().globalData.goods = {specification: []}
			}
			uni.navigateTo({
				url:'/pages/goods/addGoods'
			})
		},
		handleMenuTap(id) {	//点击菜单项事件
			if(!this.sizeCalcState) {
				this.calcSize()
			}
			this.currentCateId = id
			this.$nextTick(() => this.cateScrollTop = this.goods.find(item => item.id == id).top)
		},
		handleGoodsScroll({detail}) {	//商品列表滚动事件
			if(!this.sizeCalcState) {
				this.calcSize()
			}
			const {scrollTop} = detail
			let tabs = this.goods.filter(item=> item.top <= scrollTop).reverse()
			if(tabs.length > 0){
				this.currentCateId = tabs[0].id
			}
		},
		calcSize() {
			let h = 10
			
			let view = uni.createSelectorQuery().select('#ads')
			view.fields({
				size: true
			}, data => {
				h += Math.floor(data.height)
			}).exec()
			
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
		showGoodDetailModal(item, good) {
			this.good = JSON.parse(JSON.stringify({...good, number: 1}))
			this.category = JSON.parse(JSON.stringify(item))
			this.goodDetailModalVisible = true
		},
		// 打开 上架 下架模态框
		confirmSatausModel(goods){
			this.statusModelShow = true;
			this.currentGoods = goods;
		},
		// 关闭 上架 下架模态框
		colseStatusModelShow(){
			this.statusModelShow = false;
		},
		// 修改 商品上下架状态
		changeStatus(){
			if(this.tabIndex == 0){
				// 下架商品
				goodsStatusOff(this.currentGoods.id).then(res=>{
					this.statusModelShow = false;
					this.init();
				})
			}else{
				// 上架商品
				goodsStatusOn(this.currentGoods.id).then(res=>{
					this.statusModelShow = false;
					this.init();
				})
			}
			
		}
	}
};
</script>

<style lang="scss" >
	@import '~@/pages/goods/goods.scss';
	.flex-center{
		display: flex;
		align-items: center;
		flex-direction: column;
	}
</style>
