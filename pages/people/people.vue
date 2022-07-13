<template>
	<view class="container">
		<view class="u-demo-block " >
			<view class="u-page__swipe-action-item">
				<u-swipe-action v-if="!loading">
					<u-swipe-action-item
						v-for="(item, index) in dataList"
						:key="index"
						:name="index"
						:options="options"
						@click="clickItem"
					>
						<view class="swipe-action u-border-top u-border-bottom">
							<view class="swipe-action__content ml-20">
								<u-avatar
									class="swipe-action__content__avatar"
									shape="square"
									:src="item.avatarUrl"
								></u-avatar>
								<text class="swipe-action__content__text flex-center ml-10">{{item.nickName}}</text>
								<view class="flex-center ml-10">
									<u-tag v-if="item.role=='boss'"  text="店长" plain size="mini" type="warning" class="swipe-action__content__tag "></u-tag>
									<u-tag v-if="item.role=='manager'"  text="管理员" plain size="mini" type="warning" class="swipe-action__content__tag"></u-tag>
									<u-tag v-if="item.role=='staff'"  text="店员" plain size="mini" type="warning" class="swipe-action__content__tag"></u-tag>
								</view>
								
							</view>
						</view>
					</u-swipe-action-item>
				</u-swipe-action>
				<view class="btn-box d-flex align-items-center just-content-center" v-show="!loading">
					<view class="flex flex-direction" >
						<button class="share-btn" @click="invite">邀请新成员加入</button>
					</view>
				</view>
			</view>
		</view>
			<u-action-sheet :actions="list" :show="isShowRolePop" :closeOnClickOverlay="true" @select="selectRole" @close="closeRolePop"></u-action-sheet>
			<u-modal :show="deleteModelShow" :showCancelButton="true" @cancel="closeDeleteConfirm" @confirm="confirmDeleteItem"
					  :content="'请确认是否移除员工['+selectItem.nickName+']？'" confirmColor="#fa3534"></u-modal>
					  
					  
	</view>
	 
</template>

<script>
	import { findStoreUser,removeUser,changeRole } from'@/api/userApi.js'
	import { showToast } from '@/common/util.js'
	import { mapState } from 'vuex'
	export default {
		data() {
			return {
				loading: false,
				list: [
					{
						name:'管理员',
						value:'manager',
						subname:"（协助管理店铺事务，拥有更多权限）",
						fontSize:'20'
					},
					{
						name: '店员',
						value:'staff',
						subname:"（普通员工，支持店内点餐等操作）",
						fontSize:'20'
					}
				],
				options: [
					{
						text: '角色',
						style: {
							backgroundColor: '#3c9cff',
						}
					},
						{
						text: '删除',
						style: {
							backgroundColor: '#f56c6c'
						}
				}],
				deleteModelShow:false,
				isShowRolePop: false,
				selectItem : {},
			    dataList :[]
			}
		},
		onLoad() {
			this.queryList()
		},
		computed: {
			...mapState(['store'])
		},
		methods: {
			async queryList(){
				this.loading = true
				uni.showLoading({
				 title: '加载中',
				})
				this.dataList =[]
				const repo = await findStoreUser()
				this.loading = false
				uni.hideLoading()
				if (repo.code == 200) {
					this.dataList = repo.data
				}
			},
			clickItem(e){
				this.selectItem = this.dataList[e.name]
				if(e.index === 0){
					this.showRolePop()
				} else if (e.index === 1) {
					this.showDeleteConfirm()
				}
			},
			showRolePop(){
				this.isShowRolePop = true
			},
			closeRolePop(){
				this.isShowRolePop = false
			},
			selectRole(role){
				changeRole({userId:this.selectItem.id,role:role.value}).then(res=>{
					this.isShowRolePop = false
					if (res.code == 200) {
						this.queryList()
						showToast('修改成功');
					} else {
						showToast(res.msg);
					}
				})
			},
			showDeleteConfirm(){
				this.deleteModelShow = true
			},
			closeDeleteConfirm(){
				this.deleteModelShow = false
			},
			// 确认删除
			confirmDeleteItem(){
				removeUser(this.selectItem.id).then(res=>{
					this.deleteModelShow = false
					if (res.code == 200) {
						this.queryList()
						showToast('移除成功');
					} else {
						showToast(res.msg);
					}
				})
			},
			invite(){
				uni.navigateTo({
					url:'/pages/invite/invite'
				})
			}
		}
	}
</script>

<style lang="scss">
	.u-page {
		padding: 0;
	}
	
	.u-demo-block__title {
		padding: 10px 0 2px 15px;
	}
	
	.flex-center{
		 display: flex;
		 align-items: center;
	}
	
	.swipe-action {
		&__content {
			display: flex;
			flex-direction: row;
			padding: 25rpx 0;
			
			&__avatar {
				width: 120rpx !important;
			}
			
			&__tag {
				margin-left: 30rpx;
			}
	
			&__text {
				font-size: 15px;
				color: $u-main-color;
			}
		}
	}
	.share-btn {
	    color: #fff;
	    background-color: #f56c6c;
	    border-color: #f56c6c;
	    border-width: 1px;
	    border-style: solid;
	}
	.container {
		padding: 20rpx 30rpx;
	}
	.main{
		background: #F7F6FB;
	}
	.btn-box {
		height: calc((100vh - 40rpx) / 5);
	}
	.p_btn {
		background: #F7F6FB;
		bottom: 20;
		width: 100%;
	}
	$u-popup-flex:1 !default;
	$u-popup-content-background-color: #fff !default;
	.u-popup {
		flex: $u-popup-flex;
		&__content {
			background-color: $u-popup-content-background-color;
			position: relative;
			height: 200rpx;
		}
	}
	
</style>
