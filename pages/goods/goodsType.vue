<template>
	<view>
		<view><u-button type="error" text="新增品类" @click="addType"></u-button></view>
		<u-alert  type = "warning" :closable="true" description = "按住图标拖拽改变顺序,向左滑动编辑和删除品类"></u-alert>
		<dragSort :list="list" list-key="name" @dragSortChange="sortChange" @editItem="editItem" @deleteItem="deleteItem"></dragSort>
		<u-popup :show="showPopup" @close="closePopup" :round="10" >
		    <view class="u-block">
		        <view class="u-demo-block__content">
		        	<u--input
		        		placeholder="请输入品类名称"
		        		border="surround"
		        		v-model="typeModel.name"
		        	></u--input>
		        </view>
		    	<view class="u-demo-block__content" style="padding-top: 15px; flex-direction: column;align-items: stretch;flex-wrap: nowrap;">
		    		<u-button
		    			@click="saveGoodsType(typeModel)"
		    		    text="保存品类"
		    		    type="error"
		    		></u-button>
		    	</view>
			</view>
		</u-popup>
		<u-modal :show="deleteModelShow" :showCancelButton="true" @cancel="colseDeleteModel" @confirm="confirmDeleteItem"
				  :content="'请确认是否删除['+delItem.name+']类型？'" confirmColor="#fa3534"></u-modal>
	</view>
	
</template>


<script>
	import dragSort from '../../components/drag-sort/index.vue'
	export default {
		components:{ dragSort },
		data() {
			return {
				typeModel:{},
				showPopup:false,
				deleteModelShow:false,
				list: [],
				delItem:{}
			}
		},
		mounted() {
			this.queryList();
		},
		methods: {
			queryList(){
				this.$request.get('/goodsType?page=1&size=100').then(res=>{
					this.list = res.data;
				})
			},
			confirmDeleteItem(){
				this.$request.request({
				    // 不需要写完整的地址 只需拼上后台的路由
				    url: '/goodsType/'+this.delItem.id, 
					method: 'DELETE',
					data: this.typeModel
				}).then(res=>{
					this.deleteModelShow = false;
					this.queryList();
				});
			},
			colseDeleteModel(){
				this.deleteModelShow = false;
			},
			addType(){
				this.typeModel = {}
				this.showPopup = true; 
			},
			deleteItem(item){
				this.delItem = item;
				this.deleteModelShow = true;
			},
			editItem(item){
				this.typeModel = {
					id:item.id, 
					name:item.name, 
					order:item.order
				}
				this.showPopup = true;
			},
			closePopup(){
				this.showPopup = false;
			},
			saveGoodsType(model){
				if(!model || !model.name){
					uni.showToast({
						icon:'none',
					    title: '请输入品类名称后再进行保存操作',
					    duration: 2000
					});
					return;
				}
				this.save(model).then(res=>{
					uni.showToast({
					    title: '保存成功',
					    duration: 2000
					});
					this.queryList();
					this.closePopup();
				})
			},
			save(model){
				return this.$request.post('/goodsType/save',model)
			},
			async sortChange(e){
				const data = e.data;
				const preOrder = e.preData ? e.preData.order : 0;
				const nextOrder = e.nextData ? e.nextData.order : 0;
				if(nextOrder == 0){
					data.order = preOrder + 10;
				}else{
					data.order = preOrder + (nextOrder - preOrder)/2;
					console.info(data.order)
				}
				const res = await this.save(data)
				await this.queryList();
			}
		}
	}
</script>

<style>

</style>
