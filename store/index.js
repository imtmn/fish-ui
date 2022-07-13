import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/api'

import { GetStore } from '@/api/storeApi.js'
import { getUser } from'@/api/userApi.js'
import { getDesk } from '@/api/deskApi.js'

//蓝牙设置
import Bluetooth from '@/store/bluetooth/index.js'

Vue.use(Vuex)

const store = new Vuex.Store({
	modules: {
		Bluetooth
	},
	state: {
		sysinfo: uni.getSystemInfoSync(),//系统信息
		token: '',
		user: {},
		store: {},
		cart: [],
		orderType: 'takein',
		address: {},
		member: {},
		order: {},
		desk: {},
		qrCodeUrl:''
	},
	getters: {
		userId(state) {
			return state.user.id || null;
		},
		isLogin: state => !!state.token	,//是否登录
		isBussiness(state) { // 是否是商家
			if(!state.store){
				return false;
			}
			return state.user.storeId == state.store.id;
		},
	},
	mutations: {
		SET_TOKEN(state, token) {
			state.token = token
		},
		//更新state数据
		setStateAttr(state, param) {
			if (param instanceof Array) {
				for (let item of param) {
					state[item.key] = item.val;
				}
			} else {
				state[param.key] = param.val;
			}
		},
		SET_USER_INFO(state, user) {
			state.user = user
		},
		SET_ORDER_TYPE(state, type) {
			state.orderType = type
		},
		SET_MEMBER(state, member) {
			state.member = member
		},
		SET_ADDRESS(state, address) {
			state.address = address
		},
		SET_ADDRESSES(state, addresses) {
			state.addresses = addresses
		},
		SET_STORE(state, store) {
			state.store = store
		},
		SET_CART(state, cart) {
			state.cart = cart
		},
		REMOVE_CART(state) {
			state.cart = []
		},
		SET_ORDER(state, order) {
			state.order = order
		},
		SET_DESK_INFO(state,desk){
			state.desk = desk
		},
		SET_QRCODEURL(state, qrCodeUrl) {
			state.qrCodeUrl = qrCodeUrl
		},
	},
	actions: {
		async setUser({
			state,
			commit
		}, user) {
			commit('SET_USER_INFO', user)
			getApp().globalData.user = user
			uni.setStorageSync('user', user);
		},
		async setDesk({
			state,
			commit
		}, desk) {
			commit('SET_DESK_INFO', desk)
			uni.setStorageSync('desk', desk);
		},
		async setToken({
			state,
			commit
		}, data) {
			commit('SET_TOKEN', data)
			getApp().globalData.token = data
			uni.setStorageSync('token', data);
		},
		logout({
			state,
			commit
		}) {
			commit('setStateAttr', {
				key: 'user',
				val: {}
			})
			uni.removeStorageSync('user');
		},
		async setStore({commit},store) {
			console.info("设置店铺信息：")
			console.info(store)
			commit('SET_STORE', store)
		},
		setQrCodeUrl({commit},url){
			commit('SET_QRCODEURL', url)
		}
	}
})

export default store