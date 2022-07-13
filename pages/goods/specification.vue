<template>
	<view class="u-page">
		<view class="u-block">
			<view class="u-demo-block__content" >
				<u-button
					@click="add"
					text="添加规格"
					type="error"
					size="samll"
				></u-button>
			</view>
			<view class="u-demo-block__content" >
				<u-alert  type = "warning" description = "请选择规格"></u-alert>
			</view>
			
			<view class="block__content flex_row" style="padding-top: 8px;" v-for="(list,index) in groupList" >
				<view class="block__content flex_row" style="width: 100em;">
					<checkbox-group @change="changeCheck(list)">
						<checkbox activeColor="red"  style="transform:scale(0.8)"> {{list[0].groupName}}</checkbox>
					</checkbox-group>
				</view>
				<view class="block__content flex_row">
					<view
					    class="u-page__tag-item"
					    v-for="(item, i) in list"
					    :key="i"
					>
						<u-tag
							@close="deleteTag(item)"
							closable
						    :text="item.name"
						    :plain="!item.checked"
						    type="error"
						    :name="i"
						    @click="checkboxClick"
						>
						</u-tag>
						
					</view>
				</view>
				<u-line style="padding-top: 10px;"></u-line>
			</view>
			
			<u-popup :show="showPopup" @close="closePopup" :round="10" >
			    <view class="u-block">
					<view class="u-demo-block__content">
						<u--input
							placeholder="输入分组(如:规格/口味/其他等)"
							border="surround"
							v-model="model.groupName"
						></u--input>
					</view>
			        <view class="u-demo-block__content pt-10">
			        	<u--input
			        		placeholder="输入名称(如:小份/中份/大份|不加辣/微辣/麻辣)"
			        		border="surround"
			        		v-model="model.name"
			        	></u--input>
			        </view>
			    	<view class="u-demo-block__content" style="padding-top: 15px; flex-direction: column;align-items: stretch;flex-wrap: nowrap;">
			    		<u-button
			    			@click="save(model)"
			    		    text="保存规格"
			    		    type="error"
			    		></u-button>
			    	</view>
				</view>
			</u-popup>
		</view>
		<u-popup :show="showSelectPopup" @close="closeSelectPopup" :round="10" >
		    <view class="u-block">
		        <view class="u-demo-block__content">
		        	<u-list style="height: 40%;">
		        		<u-list-item
		        			v-for="(item, index) in selectList"
		        			:key="index"
		        		>
		        			<u-cell
		        				:title="item.name"
		        			>
								<view slot="right-icon">
									 <u--input
										type="number"
									    placeholder="设定价格,不填为默认价格"
									    border="surround"
									    v-model="item.price"
									  ></u--input>
								</view>
								
		        			</u-cell>
		        		</u-list-item>
		        	</u-list>
		        </view>
				
		    	<view class="u-demo-block__content" style="padding-top: 15px; flex-direction: column;align-items: stretch;flex-wrap: nowrap;">
		    		<u-button
		    			@click="select()"
		    		    text="确认"
		    		    type="error"
		    		></u-button>
		    	</view>
			</view>
		</u-popup>
		<u-modal :show="deleteModelShow" :showCancelButton="true" @cancel="colseDeleteModel" @confirm="confirmDeleteItem"
				  :content="'请确认是否删除['+deleteItem.name+']规格？'" confirmColor="#fa3534"></u-modal>
	</view>
</template>

<script>
import _ from 'lodash';
export default {
	data() {
		return {
			selectList:[],
			showSelectPopup:false,
			model:{},
			showPopup:false,
			groupList:[],
			deleteModelShow:false,
			deleteItem:{},
			changePrice:false
		}
	},
	onLoad() {
		this.queryList();
	},
	methods: {
		select(){
			const oldVal = getApp().globalData.goods.specification
			_.remove(oldVal, item => {
			  return  item.groupName == this.selectList[0].groupName;
			});
			const newVal = _.unionBy(oldVal,this.selectList, 'name')
			getApp().globalData.goods.specification = newVal
			uni.navigateTo({
				url:'/pages/goods/addGoods'
			})
		},
		changeCheck(list){
			this.showSelectPopup = true
			this.selectList = list
			console.info(list)
		},
		closeSelectPopup(){
			this.showSelectPopup = false
		},
	    queryList(){
			this.$request.get('/specification?page=1&size=100').then(res=>{
				if(res.code === 200){
					this.groupList = this.arrayGroupBy(res.data,'groupName');
				}
			})
		},
		arrayGroupBy(list, groupId) {
		    let sorted = this.groupBy(list, function (item) {
		        return [item[groupId]];
		    });
		    return sorted;
		},
		 groupBy  (array, f)  {
		    let groups = {};
		    array.forEach(function (o) {
		        var group = JSON.stringify(f(o));
		        groups[group] = groups[group] || [];
		        groups[group].push(o);
		    });
		    return Object.keys(groups).map(function (group) {
		        return groups[group];
		    });
		},
		save(){
			if(!this.model || !this.model.name){
				uni.showToast({
					icon:'none',
				    title: '请输入品类名称后再进行保存操作',
				    duration: 2000
				});
				return;
			}
			this.$request.post('/specification/save',this.model).then(res=>{
				this.queryList();
				this.closePopup();
			})
		},
		add(){
			this.model = {}
			this.showPopup = true; 
		},
		confirmDeleteItem(item){
			this.deleteModelShow = false;
			this.$request.request({
			    // 不需要写完整的地址 只需拼上后台的路由
			    url: '/specification/'+this.deleteItem.id, 
				method: 'DELETE',
				data: this.typeModel
			}).then(res=>{
				this.queryList();
			});
		},
		deleteTag(item){
			this.deleteItem = item
			this.deleteModelShow = true
		},
		colseDeleteModel(item){
			this.deleteModelShow = false;
		},
		closePopup(){
			this.showPopup = false;
		}
	}
}
</script>

<style>
.u-demo-block__title{
	width: 100em;
	font-size: 16px;
	color: #8f9ca2;
	margin-bottom: 8px;
}
.pt-10{
	padding-top: 10px;
}
.u-input{
	background-color: #fff;
}
.flex_row {
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
}
.u-page__tag-item {
	margin: 2px 4px;
}

.block__content{
	display: flex;
	flex-direction: row;
}
	
</style>
