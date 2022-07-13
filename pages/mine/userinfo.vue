<template>
	<view class="container d-flex flex-column">
		<view class="flex-fill form">
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">头像</view>
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
					<view class="label">昵称</view>
					<view class="input flex-fill">
						<input type="text" placeholder="请填写昵称" placeholder-class="text-color-assist font-size-base" 
						v-model="user.nickName">
					</view>
				</view>
			</list-cell>
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">手机号码</view>
					<view class="input flex-fill">
						<input type="text" v-model="user.phone" >
					</view>
				</view>
			</list-cell>
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">性别</view>
					<view class="input flex-fill">
						<view class="radio-group">
							<view class="radio" :class="{'checked': user.gender == '男'}" style="margin-right: 10rpx;" @tap="user.gender='男'">先生</view>
							<view class="radio" :class="{'checked': user.gender == '女'}" @tap="user.gender='女'">女士</view>
						</view>
					</view>
				</view>
			</list-cell>
			<list-cell :hover="false">
				<view class="form-input w-100 d-flex align-items-center">
					<view class="label">地址</view>
					<view class="input flex-fill">
						<input type="text" v-model="user.address" >
					</view>
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
	import { mapState } from 'vuex'
	import { getUser,saveUser } from'@/api/userApi.js'
	import { uploadFile } from '@/api/goodsApi.js'
	export default {
		components: {
			listCell
		},
		data() {
			return {
				fileList:[],
				user: {},
			}
		},
		computed: {
			...mapState(['userInfo'])
		},
		onLoad() {
			this.queryUser()
		},
		methods: {
			async queryUser(){
				const repo = await getUser()
				if (repo.code == 200) {
					this.user = repo.data
					this.fileList = [{
						type: "image",
						url: this.user.avatarUrl
					}]
				}
				
			},
			async save() {
				const repo = await saveUser(this.user)
				if (repo.code == 200) {
					this.$store.dispatch('setUser',repo.data)
					uni.navigateBack()
					uni.showToast({
					    title: '保存成功',
					    duration: 2000
					});
				} else {
					uni.showToast({
						icon:'error',
					    title: `保存失败，由于：${res.msg}`,
					    duration: 2000
					});
				}
				
			},
			async afterRead(e){
				console.info('afterRead')
				const path = await this.uploadFilePromise(e.file)
				const url = this.$config.fileUrl + path
				this.fileList = [{
					status: 'success',
					message: '',
					url: url
				}]
				this.user.avatarUrl = url
				this.save(true)
			},
			uploadFilePromise(file) {
				return new Promise((resolve, reject) => {
					uploadFile({
					    // 不需要写完整的地址 只需拼上后台的路由
					    url: '/upload/token', 
						filePath: file.url,
						name: 'file',
					    success: res => {
							console.info(res)
							resolve(JSON.parse(res).path)
					    },
						error:res =>{
							console.error(res)
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
