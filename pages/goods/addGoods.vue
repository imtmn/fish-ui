<template>
	<view class="u-page">
		<view class="u-block">
		    <view class="u-demo-block__content">
		    	<u--input
		    		placeholder="请输入菜品名称"
		    		border="surround"
		    		v-model="goodsModel.name"
		    	></u--input>
		    </view>
			<view class="u-demo-block__content" style="padding-top: 8px;">
				<u--textarea v-model="goodsModel.remark" placeholder="请输入菜品描述" ></u--textarea>
			</view>
			<view class="u-demo-block__content" style="padding-top: 8px;">
				<u--input v-model="goodsModel.price" type="number" placeholder="请输入菜品价格(元)" ></u--input>
			</view>
			<view class="u-demo-block__content" style="padding-top: 8px;" v-show="false">
				<u-row customStyle="margin-bottom: 10px">
				    <u-col span="8">
				        <view class="u-demo-block__title">
							<text>请添加菜品规格</text>
						</view>
				    </u-col>
				    <u-col span="4">
				        <view class="demo-layout bg-purple">
							<u-button text="+ 添加规格" type="error" size="mini" @click="addSpecification"></u-button>
						</view>
				    </u-col>
				</u-row>
				<u-row v-for="(group, index) in specificationGroup" :key="index">
					<view class="u-demo-block__content flex_row ">
						<view class="group-title">{{group[0].groupName}}:</view>
						<view
						    class="u-page__tag-item"
						    v-for="(item, idx) in group"
						    :key="idx"
						>
							<u-tag
								@close="deleteTag(item)"
								size="mini"
							    closable 
							    :text="item.name + (item.price ? ' - ' +item.price + '元' : '') "
								plain 
							    type="error"
							    :name="idx"
							>
							</u-tag>
						</view>
					</view>
				</u-row>
					
				
			</view>
			<view class="u-demo-block__content flex_row" style="padding-top: 16px;">
				<text class="u-demo-block__title">请选择菜品类别</text>
				<view class="u-demo-block__content flex_row">
					<view
					    class="u-page__tag-item"
					    v-for="(item, index) in typeList"
					    :key="index"
					>
						<u-tag
						    :text="item.name"
						    :plain="!item.checked"
							shape="circle"
						    type="error"
						    :name="index"
						    @click="checkboxClick"
						>
						</u-tag>
					</view>
				</view>
			</view>
			<view class="u-demo-block__content flex_row" style="padding-top: 8px;">
				<text class="u-demo-block__title">请上传菜品图片</text>
				<u-upload
					:fileList="fileList"
					@afterRead="afterRead"
					@delete="deletePic"
					name="3"
					multiple
					:maxCount="1"
					:previewFullImage="true"
				></u-upload>
			</view>
			<view class="u-demo-block__content" style="padding-top: 15px; flex-direction: column;align-items: stretch;flex-wrap: nowrap;">
				<u-button
					@click="saveGoods"
				    text="保存菜品"
				    type="error"
				></u-button>
			</view>
		</view>
		<u-modal :show="deleteModelShow" :showCancelButton="true" @cancel="colseDeleteModel" @confirm="confirmDeleteItem"
				  :content="'请确认是否删除['+deleteItem.name+']规格？'" confirmColor="#fa3534"></u-modal>
		<u-notify ref="uNotify" message="Hi uView"></u-notify>
	</view>
</template>

<script>
import _ from 'lodash'
import {uploadFile,findGoodsType} from '@/api/goodsApi.js'
export default {
	components: {
		// modal,
		// popupLayer
	},
	async onLoad() {
		await this.init()
	},
	onUnload(){
		uni.$off('changeSpecification')
	},
	data() {
		return {
			goodsModel:{
				specification:[]
			},
			specificationGroup:{},
			typeList: [],
			fileList:[],
			deleteModelShow:false,
			deleteItem:{},
			errMsg:''
		}
	},
	computed:{
	},
	methods:{
		async init() {	
			this.goodsModel = getApp().globalData.goods
			this.specificationGroup = _.groupBy(this.goodsModel.specification,'groupName')
			if(!_.isEmpty(this.goodsModel.imgs)){
				this.fileList = this.goodsModel.imgs.map(path=>{
					return {
						type: "image",
						url: this.$config.fileUrl+path,
						path:path
					}
				})
				console.info(this.fileList)
			}
			this.queryTypeList()
		},
		// 查询商品类型
		queryTypeList(){
			findGoodsType().then(res=>{
				const selectedTypesId = this.goodsModel.goodsType ? this.goodsModel.goodsType.map(item=>item.id) : [];
				this.typeList = res.data.map(item=> {
					item['checked'] = selectedTypesId.indexOf(item.id) >= 0;
					return item;
				});
			})
		},
		//添加菜品规格
		addSpecification(){
			getApp().globalData.goods = this.goodsModel
			uni.navigateTo({
				url:'/pages/goods/specification'
			})
		},
		// 删除规格属性
		deleteTag(item){
			this.deleteItem = item
			this.deleteModelShow = true
		},
		colseDeleteModel(item){
			this.deleteModelShow = false;
		},
		confirmDeleteItem(){
			this.deleteModelShow = false;
			_.remove(this.goodsModel.specification, item=> {
			  return item.name == this.deleteItem.name;
			});
			this.specificationGroup = _.groupBy(this.goodsModel.specification,'groupName')
		},
		goodsTypeChange(){
			
		},
		checkboxClick(name) {
			this.typeList[name].checked = !this.typeList[name].checked
		},
		saveGoods(){
			if(!this.goodsModel.name){
				this.$refs.uNotify.error('菜品名称不能为空')
				return;
			}
			
			if(!this.goodsModel.price || this.goodsModel.price <= 0 || this.goodsModel.price >9999){
				this.$refs.uNotify.error('菜品价格应在0-9999之间')
				return;
			}
			
			if(this.fileList && this.fileList.length > 0){
				this.goodsModel.imgs = this.fileList.map(item=>item.path)
				this.goodsModel.mainImags = this.goodsModel.imgs[0]
			}
			const typeListCheck = this.typeList.filter(item=>item.checked);
			this.goodsModel.goodsType = typeListCheck;
			this.$request.post('/goods/save',this.goodsModel).then(res=>{
				if(res.code === 200){
					uni.$emit('refreshData');
					uni.navigateBack({
					    delta: 1
					})
					uni.showToast({
					    title: '保存成功',
					    duration: 2000
					});
					
				}else{
					uni.showToast({
						icon:'error',
					    title: `保存失败，由于：${res.msg}`,
					    duration: 2000
					});
				}
			})
		},
		async afterRead(e){
			// 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
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
			console.info(this.fileList)
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
		deletePic(e){
			this.fileList.splice(e.index, 1)
		}
	}
}
</script>

<style lang="scss" >
	@import '~@/pages/goods/goods.scss';
	.u-demo-block__title{
		width: 100%;
	}
	
	.u-page__tag-item {
		margin-right: 10px;
		margin-top: 5px;
	}
	.flex_column {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		align-items: center;
	}
	.flex_row {
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
	}
	.u-input{
		background-color: #fff;
	}
	.group-title{
		padding-top: 14px;
		padding-right: 10px;
		font-size: 14px;
		color: #8f9ca2;
	}
	
</style>
