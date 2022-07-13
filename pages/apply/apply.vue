<template>
	<view class="u-page" >
		<view class="container p-20 pt-10" v-if="storeModel.id">
				<u-alert type = "warning" description = "您的申请已经提交,我们将在1到2个工作日内完成审批"></u-alert>
			<u-steps current="1" class="mt-30">
				<u-steps-item title="已申请"></u-steps-item>
				<u-steps-item title="审批中"></u-steps-item>
				<u-steps-item title="完成"></u-steps-item>
			</u-steps>
		</view>
		<view class="container p-20" v-show="!storeModel.id">
			<u--form
				labelPosition="left"
				:model="storeModel"
				:rules="rules"
				ref="feedbackForm"
			>
				<u-form-item
					label="店铺名称"
					prop="name"
					borderBottom
					ref="item3"
				>
					<u--input
						placeholder="输入店铺名称"
						v-model="storeModel.name"
						count
					></u--input>
				</u-form-item>
				<u-form-item
					label="店铺简介"
					prop="remark"
					borderBottom
					ref="item3"
				>
					<u--textarea
						placeholder="店铺简介,不低于3个字"
						v-model="storeModel.remark"
						count
					></u--textarea>
				</u-form-item>
				<u-form-item
					label="营业执照"
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
					prop="personName"
					borderBottom
					ref="item3"
				>
					<u--input
						placeholder="输入姓名"
						v-model="storeModel.personName"
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
						v-model="storeModel.phone"
						count
					></u--input>
				</u-form-item>
				<u-form-item
					label="备注说明"
					prop="info"
					borderBottom
					ref="item3"
				>
					<u--textarea
						placeholder="输入备注说明"
						v-model="storeModel.info"
						count
					></u--textarea>
				</u-form-item>
				<u-button
					type="error"
					text="提交申请"
					customStyle="margin-top: 20px"
					@click="submit"
				></u-button>
			</u--form>
		</view>
	</view>
</template>

<script>
	import { SaveApplicationForm,GetApplicationForm } from '@/api/storeApi.js'
	import { uploadFile } from '@/api/goodsApi.js'
	export default {
		data() {
			return {
				
				fileList: [],
				storeModel: {
					name:'',
					content:'',
					imgs:'',
					personName:'',
					phone:'',
					info:''
				},
				rules: {
					'name': [{
						type: 'string',
						required: true,
						message: '请填写店铺名称',
						trigger: ['blur', 'change']
					}],
					'content': [{
						type: 'string',
						required: true,
						message: '请填写店铺简介',
						trigger: ['blur', 'change']
					}],
					'personName': [{
						type: 'string',
						required: true,
						message: '请填写姓名',
						trigger: ['blur', 'change']
					}],
					'phone': [{
						type: 'string',
						required: true,
						message: '请填写联系电话',
						trigger: ['blur', 'change']
					}],
				}
			}
		},
		onReady() {
			// 如果需要兼容微信小程序，并且校验规则中含有方法等，只能通过setRules方法设置规则
			this.$refs.feedbackForm.setRules(this.rules)
		},
		onLoad(){
			GetApplicationForm().then(res=>{
				if(res && res.data ){
					this.storeModel = res.data
				}
			})
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
				if(!this.fileList.length){
					uni.showToast({
						icon:'none',
						title: '请上传营业执照'
					});
					return;
				}
				this.storeModel.imgs = this.fileList.map(item=>item.url)
				// 如果有错误，会在catch中返回报错信息数组，校验通过则在then中返回true
				this.$refs.feedbackForm.validate().then(res => {
					SaveApplicationForm(this.storeModel).then(res=>{
						if(res.code == '200'){
							uni.showToast({
								title: '已提交申请'
							});
							setTimeout(()=>{
								uni.navigateBack({
								    delta: 1
								})
							},2000)
						}else{
							uni.showToast({
								title: res.msg
							});
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
	padding: 0px;
}
.container {
	border-radius: 8rpx;
	background-color: #fff;
}
.form{
	padding: 20rpx 30rpx;
}

</style>
