<template>
	<view class="u-page">
		<view class="u-demo-block ">
			<view class="u-demo-block__content container p-20">
				<u--form
					class="p-20"
					labelPosition="left"
					:model="feedBackModel"
					:rules="rules"
					ref="feedbackForm"
				>
					
					<u-form-item
						label="留言内容"
						prop="content"
						borderBottom
						ref="item3"
					>
						<u--textarea
							placeholder="不低于3个字"
							v-model="feedBackModel.content"
							count
						></u--textarea>
					</u-form-item>
					<u-form-item
						label="图片列表"
						prop="imgs"
						borderBottom
						ref="item3"
					>
						<u-upload
							:fileList="fileList"
							@afterRead="afterRead"
							@delete="deletePic"
							name="1"
							multiple
							:maxCount="10"
						></u-upload>
					</u-form-item>
					<u-form-item
						label="姓名"
						prop="name"
						borderBottom
						ref="item3"
					>
						<u--input
							placeholder="输入姓名"
							v-model="feedBackModel.name"
							count
						></u--input>
					</u-form-item>
					<u-form-item
						label="联系电话"
						prop="phone"
						borderBottom
						ref="item3"
					>
						<u--input
							placeholder="输入联系电话"
							v-model="feedBackModel.phone"
							count
						></u--input>
					</u-form-item>
					<u-button
						type="error"
						text="提交"
						customStyle="margin-top: 20px"
						@click="submit"
					></u-button>
				</u--form>
			</view>
			
		</view>
	</view>
</template>

<script>
	import { saveFeedback } from '@/api/feedbackApi.js'
	import { uploadFile } from '@/api/goodsApi.js'
	export default {
		data() {
			return {
				fileList: [],
				feedBackModel: {
					content:''
				},
				rules: {
					'content': [{
						type: 'string',
						required: true,
						message: '请填写留言内容',
						trigger: ['blur', 'change']
					}],
				}
			}
		},
		onReady() {
			// 如果需要兼容微信小程序，并且校验规则中含有方法等，只能通过setRules方法设置规则
			this.$refs.feedbackForm.setRules(this.rules)
		},
		methods: {
			async afterRead(e) {
				let lists = [].concat(e.file)
				let fileListLen = this.fileList.length
				lists.map((item) => {
					this.fileList.push({
						...item,
						status: 'uploading',
						message: '上传中'
					})
				})
				for (let i = 0; i < lists.length; i++) {
					const path = await this.uploadFilePromise(lists[i])
					let item = this.fileList[fileListLen]
					this.fileList.splice(fileListLen, 1, Object.assign(item, {
						status: 'success',
						message: '',
						url: this.$config.fileUrl+path,
						path:path
					}))
					fileListLen++
				}
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
			navigateBack() {
				uni.navigateBack()
			},
			submit() {
				if(this.fileList.length){
					this.feedBackModel.imgs = this.fileList.map(item=>item.url)
				}
				// 如果有错误，会在catch中返回报错信息数组，校验通过则在then中返回true
				this.$refs.feedbackForm.validate().then(res => {
					saveFeedback(this.feedBackModel).then(res=>{
						if(res.code == '200'){
							uni.showToast({
								title: '反馈成功'
							});
							setTimeout(()=>{
								uni.navigateBack({
								    delta: 1
								})
							},2000)
							
						}
					})
				})
			},
			reset() {
				const validateList = ['userInfo.name']
				this.$refs.feedbackForm.resetFields()
				this.$refs.feedbackForm.clearValidate()
				setTimeout(()=>{
					this.$refs.feedbackForm.clearValidate(validateList)
					// 或者使用 this.$refs.feedbackForm.clearValidate()
				},10)
			}
		},
	}
</script>

<style lang="scss">
.u-page {
	padding: 15px 15px 40px 15px;
}
.container {
	border-radius: 10rpx;
	background-color: #fff;
}
.form{
	padding: 20rpx 30rpx;
}

</style>
