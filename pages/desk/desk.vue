<template>
	<view>
		<!-- desk box begin -->
		<view class="service-box">
			<view class="font-size-lg text-color-base font-weight-bold" style="margin-bottom: 20rpx;">桌号管理</view>
			<view class="row">
				<view class="grid" :key="index" v-for="(item,index) in deskList" @tap="select(item)">
					<view class="image" >
						<image src="/static/images/mine/desk.png"></image>
					</view>
					<view>{{item.name}}</view>
				</view>
				
				<view class="grid">
					<view class="add-image" @tap="addDesk">
						<image src="/static/images/mine/add.png"></image>
					</view>
				</view>
			</view>
		</view>
		<u-alert class="alert" type = "warning" description = "点击图标进行桌号维护"></u-alert>
		<!-- desk box end -->
		
		<!-- 操作选择列表 -->
		<u-action-sheet :actions="actionList" :show="showSelect" @close="showSelect = false" @select="clickSelect"></u-action-sheet>
		
		<!-- 桌号保存界面 -->
		<u-popup :show="showModel" @close="showModel = false" @open="open">
		    <view class="u-block">
		        <view class="u-demo-block__content">
		        	<u--input
		        		placeholder="请输入桌名"
		        		border="surround"
		        		v-model="deskInfo.name"
		        	></u--input>
		        </view>
		    	<view class="u-demo-block__content" style="padding-top: 15px; flex-direction: column;align-items: stretch;flex-wrap: nowrap;">
		    		<u-button
		    			@click="saveDesk()"
		    		    text="保存桌名"
		    		    type="error"
		    		></u-button>
		    	</view>
		    </view>
		</u-popup>
		
		<!-- 删除确认 -->
		<u-modal :show="showDelete" :showCancelButton="true" @cancel="showDelete = false" @confirm="confirmDelete"
				  :content="'请确认是否删除['+deskInfo.name+']桌？'" confirmColor="#fa3534"></u-modal>
				  
				  
		<!-- 二维码 -->
		<u-modal :show="showQrcode" @cancel="showQrcode=false" @confirm="downLoadQrCode"
				confirmColor="#fa3534" confirmText="下载二维码" cancelText="关闭" :showCancelButton="true">
			<view class="slot-content">
				<image
					class="u-cell-icon"
					:src="'data:image/jpeg;base64,'+qrCodeImgBase64"
					mode="widthFix"
				></image>
				
				<view class="txt-center color-666">{{deskInfo.name}}</view>
			</view>	
		</u-modal>	
		
	</view>
</template>

<script>
	import { mapGetters,mapMutations } from 'vuex'
	import { findDesk,saveDesk,deleteDesk,getDeskQrcode } from '../../api/deskApi.js'
	
	export default {
		data() {
			return {
				actionList:[
					{ name:'二维码' },
					{ name:'修改' },
					{ name:'删除' },
				],
				showSelect: false,
				showModel: false,
				showDelete: false,
				showQrcode: false,
				qrCodePath:'',
				qrCodeImgBase64:'',
				deskInfo:{},
				deskList:[]
			}
		},
		computed:{
			...mapGetters(['isLogin','existStore'])
		},
		onLoad(){
			uni.$on('refreshData', () => {
			   this.queryList()
			})
			if(!this.isLogin) {
				this.login()
				return
			}
			this.queryList()
		},
		methods: {
			...mapMutations(['SET_QRCODEURL']), 
			async queryList(){
				const repo = await findDesk()
				if(repo.code == 200){
					this.deskList = repo.data
				}
			},
			open(){
				this.showModel = true
			},
			select(item){
				this.deskInfo = item
				this.showSelect = true
			},
			clickSelect(e){
				if(e.name == '修改'){
					this.showModel = true
				}else if(e.name == '删除'){
					this.showDelete = true
				}else if(e.name == '二维码'){
					// this.showQrcode = true
					this.SET_QRCODEURL('https://mtmn.top/ucode/' + this.deskInfo.id)
					uni.navigateTo({
						url: '/pages/desk/qrcode?text=' + this.deskInfo.name
					})
					// this.$refs.qrcode._makeCode()
					// this.getCode()
				}
			},
			async getCode(){
				const repo = await getDeskQrcode(this.deskInfo.id)
				if(repo.code == 200 ){
					this.qrCodeImgBase64 = repo.data
				}
			},
			// 下载二维码
			downLoadQrCode(){
				const fileManager = uni.getFileSystemManager()
				fileManager.writeFile({
					filePath: wx.env.USER_DATA_PATH+'/img.jpg', // 指定图片的临时路径
					data: this.qrCodeImgBase64, // 要写入的文本或二进制数据
					encoding: 'base64', // 指定写入文件的字符编码
					success: res => {
						console.log('写入文件成功', res)
						console.log(wx.env.USER_DATA_PATH + '/img.jpg')
						uni.saveImageToPhotosAlbum({ // 保存图片到相册
						  filePath: wx.env.USER_DATA_PATH + '/img.jpg',
						  success: function (res) {
							  console.log('保存成功', res)
								uni.showToast({
								  title: '保存成功',
								})
						  },
						  fail: function (err) {
							 console.log('写入文件失败', err)
							 uni.showToast({
							 	title:"文件保存失败"
							 })
						  }
						})
					},
					file: err => {
						console.log('写入文件失败', err)
						uni.showToast({
							title:"写入文件失败"
						})
						
					}

				})
				
			},
			async confirmDelete(){
				const repo = await deleteDesk(this.deskInfo.id)
				if(repo.code == 200){
					this.showDelete = false
					uni.showToast({
						title: '删除成功'
					});
					this.queryList()
				}else{
					uni.showToast({
						title: '删除失败,由于：'+repo.msg
					});
				}
			},
			addDesk(){
				this.deskInfo = {}
				this.showModel = true
			},
			login() {
				uni.navigateTo({
					url: '/pages/login/login'
				})
			},
			async saveDesk(){
				if(!this.deskInfo.name){
					uni.showToast({
						title: '请输入桌名'
					});
					return 
				}
				if(this.deskInfo.name.length>40){
					uni.showToast({
						title: '输入桌面太长，请重新输入'
					});
					return 
				}
				const repo = await saveDesk(this.deskInfo)
				if(repo.code == 200){
					this.showModel = false
					uni.showToast({
						title: '保存成功'
					});
					this.queryList()
				}else{
					uni.showToast({
						title: '保存失败,' + repo.msg
					});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.alert{
	padding: 10rpx;
}
.txt-center{
	text-align: center;
}
.color-666{
	color: #666;
}
.service-box {
	width: 100%;
	background-color: #FFFFFF;
	padding: 32rpx 30rpx 10rpx;
	box-shadow: $box-shadow;
	
	.row {
		display: flex;
		flex-wrap: wrap;
		color: $text-color-assist;
		font-size: $font-size-sm;
		padding-bottom: -40rpx;
		
		.grid {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			margin-bottom: 40rpx;
			width: 33%;
			position: relative;
			
			.image {
				image {
					width: 120rpx;
					height: 120rpx;
					margin-bottom: 20rpx;
				}
			}
			
			.add-image {
				image {
					width: 90rpx;
					height: 90rpx;
					margin-bottom: 20rpx;
				}
			}
			.new-badage {
				width: 40rpx;
				height: 40rpx;
				position: absolute;
				top: 0;
				right: 30rpx;
			}
		}
	}
}
</style>
