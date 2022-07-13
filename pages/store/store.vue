<template>
	<view class="container d-flex flex-column">
		<view class="flex-fill form">
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">背景</view>
					<view class="input flex-fill">
						<u-upload
							width='150rpx' height='150rpx'
							name="file"
							:maxCount="1"
							:previewImage="true"
							:fileList="fileList"
							@afterRead="afterRead"
							@delete="deletePic"
						></u-upload>
					</view>
				</view>
			</list-cell>
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">名称</view>
					<view class="input flex-fill">
						<u--input
							style="background-color: #fff"
							placeholder="输入店铺名称"
							border="none"
							v-model="storeInfo.name"
						  ></u--input>
					</view>
				</view>
			</list-cell>
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">简介</view>
					<view class="input flex-fill">
						<u--textarea
							placeholder="输入店铺简介"
							border="none"
							v-model="storeInfo.remark"
						  ></u--textarea>
					</view>
				</view>
			</list-cell>
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">隐藏价格</view>
					<view class="input flex-fill">
						<u-switch v-model="storeInfo.hidePrice" activeColor="#f56c6c"></u-switch>
						
					</view>
					<u-alert type = "warning" description = "选中后点餐界面不显示价格" style="padding-left: 10rpx;"></u-alert>
					
				</view>
			</list-cell>
			
		</view>
		<view class="btn-box d-flex align-items-center just-content-center">
			<button type="primary" class="save-btn" @tap="save">保存</button>
		</view>
	</view>
</template>

<script>
	import listCell from '@/components/list-cell/list-cell'
	import { mapState,mapActions } from 'vuex'
	import { GetStore,SaveStore	} from '@/api/storeApi.js'
	import { uploadFile } from '@/api/goodsApi.js'
	import { showToast } from '@/common/util.js'
	export default {
		components: {
			listCell
		},
		data() {
			return {
				fileList:[],
				storeInfo: {}
			}
		},
		computed: {
			...mapState(['store','user'])
		},
		onLoad() {
			this.init()
		},
		methods: {
			async init(){
				// await this.initBaseData();
				this.initStoreInfo();
			},
			async initStoreInfo(){
				const res = await GetStore()
				if(res.code == 200){
					this.storeInfo = res.data
					this.$store.dispatch('setStore', this.storeInfo);
					if(this.storeInfo.avatarPath) {
						this.fileList = [{
							type: "image",
							url: this.$config.fileUrl+this.storeInfo.avatarPath,
							path:this.storeInfo.avatarPath
						}]
					}
					
				}else{
					showToast('获取店铺资料失败');
				}
			},
			save(isUploadImg) {
				if(!this.storeInfo.name && !isUploadImg){
					showToast('请先设置店铺名称再进行保存哦');
					return;
				}
				SaveStore(this.storeInfo).then(res=>{
					if(res.code == 200){
						this.showNameInput = false
						this.initStoreInfo();
						showToast('已保存');
						uni.$emit('refreshUser');
						uni.navigateBack({
						    delta: 1
						})
						return
					} else {
						showToast('出现了点小问题，无法进行保存，您可以在问题反馈将问题反馈给我们');
					}
				})
			},
			async afterRead(e){
				console.info('afterRead')
				const path = await this.uploadFilePromise(e.file)
				this.fileList = [{
					status: 'success',
					message: '',
					url: this.$config.fileUrl + path
				}]
				this.storeInfo.avatarPath = path
				// this.save(true)
			},
			uploadFilePromise(file) {
				return new Promise((resolve, reject) => {
					uploadFile({
					    // 不需要写完整的地址 只需拼上后台的路由
					    url: '/upload/token', 
						filePath: file.url,
						name: 'file',
					    success: res => {
							resolve(JSON.parse(res).path)
					    }
					});
				})
			},
			deletePic(){
				this.fileList = []
			}
		}
	}
</script>

<style lang="scss" scoped>
page {
	height: 100%;
}
.container {
	padding: 20rpx 30rpx;
}

.form {
	border-radius: 8rpx;
}

.form-input {
	.label {
		width: 160rpx;
		font-size: $font-size-base;
		color: $text-color-base;
	}
	
	.input {
	}
	
	.radio-group {
		display: flex;
		justify-content: flex-start;
		
		.radio {
			padding: 10rpx 30rpx;
			border-radius: 6rpx;
			border: 2rpx solid $text-color-assist;
			color: $text-color-assist;
			font-size: $font-size-base;
			
			&.checked {
				background-color: $color-primary;
				color: $text-color-white;
				border: 2rpx solid $color-primary;
			}
		}
	}
}

.btn-box {
	height: calc((100vh - 40rpx) / 2);
}

.save-btn {
	width: 90%;
	border-radius: 50rem !important;
	font-size: $font-size-lg;
}
</style>
