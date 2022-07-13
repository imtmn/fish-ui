import {mapState, mapMutations, mapActions, mapGetters} from 'vuex'
import { login } from '@/api/sysApi.js';
import { getUser } from '@/api/userApi.js';
import { getDesk } from '@/api/deskApi.js';
import { GetStore } from '@/api/storeApi.js';
export default {
    data() {
        return {
		
        }
    },
	computed:{
		...mapState(['user']),
		...mapGetters(['isLogin']),
	},
	methods:{
		...mapActions(['setToken']),
		// 登录初始化
		async loginInit(){
			console.info('mixin on loginInit start ')
			if (!this.isLogin) {
				//还未登录，则进行自动登录
				// #ifdef H5
				// login by H5
				// #endif  
				// #ifdef MP-WEIXIN
				await this.loginByWx()
				// #endif  
			}
			console.info('mixin on loginInit end' )
		},
		async loginByWx(){
			const isAuth = await this.isAuthorize()
			if (!isAuth){
				uni.showToast({
					title:"请先授权登录"
				})
				return;
			}
			// 小程序获取code
			const {code} = await wx.login();
			if(!code){
				showToast('授权登录失败，请重试');
				return
			}
			await this.loinByWxCode(code)
		},
		async loinByWxCode(code){
			// 用code 拉取用户信息
			const repo = await login({ code:code});
			if(repo && repo.code == 200){
				this.$store.dispatch('setToken', repo.token);
				await this.initBaseData()
				return;
			}
		},
		// 登录成功，初始化基础数据
		async initBaseData(){
			// 初始化用户数据
			await this.initUserInfo()
			// 如果是扫码点餐，
			const deskId = uni.getStorageSync('deskId')
			if(deskId){
				// 扫码点餐，根据二维码初始化店铺和桌号信息
				await this.initStoreAndDesk()
			} else {
				//根据用户初始化店铺信息
				await this.initStore(this.user.storeId)
			}
		},
		// 初始化店铺信息
		async initStore(storeId){
			const repo = await GetStore(storeId)
			if(repo.code == 200){
				this.$store.dispatch('setStore', repo.data);
			}
		},
		// 初始化店铺和桌号信息
		async initStoreAndDesk(){
			const repo = await getDesk()
			if (repo.code == 200) {
				const desk = repo.data;
				this.$store.dispatch('setDesk', desk);
				this.initStore(desk.storeId)
			}
		},
		//初始化用户信息
		async initUserInfo(){
			console.info("--初始化用户信息--")
			const repo = await getUser()
			if (repo.code == 200 && repo.data) {
				const user =  repo.data;
				this.$store.dispatch('setUser', user);
				console.info(user)
				if(!user.nickName){
					//去授权页面获取基本信息
					this.registerByWx()
				}
			}
		},
		registerByWx(){
			console.info("------registerByWx-------------")
			let pages = getCurrentPages();
			let route = pages[pages.length - 1].route;
			console.info("route : "+route)
			if (route.indexOf('/login/login') >= 0){
				// 已经在登录
				return;
			}
			//跳转授权页面 注册用户信息
			console.info("navigateTo : login")
			uni.navigateTo({
				url: '/pages/login/login'
			})
			return
		},
		isAuthorize() {
		  return new Promise((resolve, reject) => {
			wx.getSetting({
			  success: res => {
			    if (res.authSetting['scope.userInfo']) {
			      resolve(true)
			    } else {
			      reject(false)
			    }
			  }
			})
		  })
		}
	}
}
