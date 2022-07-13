<script>
	export default {
		 globalData: {
			token:'',
			//用于新增菜品页面跨页面通信
			goods: {
				specification: []  
			},
			Bluetooth: {},
			//扫码后 桌号Id
			deskInfo:{}
		    
		 },  
		onLaunch: function() {
		},
		onShow: function() {
			
		},
		onHide: function() {
			
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/static/style/app.scss';
	@import "@/uni_modules/uview-ui/index.scss";
	
</style>
