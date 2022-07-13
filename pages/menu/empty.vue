<template>
	<view>
		<u-empty
				text="店铺信息为空,您可以进行以下操作"
		        icon="/static/images/common/order.png"
		>
			<view class="mt-30">
				<u-button  text="扫码点餐" type="error" @click="scanCodeHandle"></u-button>
			</view>
			<view class="mt-30">
				<u-button  text="了解更多" type="error" @click="learnMore"></u-button>
			</view>
			<view class="mt-30">
				<u-button  text="申请成为商家" type="error" @click="apply"></u-button>
			</view>
		</u-empty>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			scanCodeHandle() {
				uni.scanCode({
					success: (res) => {
						console.log('扫码成功', res)
					},
					fail: (err) => {
						console.log('扫码失败', err)
					},
					complete: () => {
						console.log('扫码结束')
					}
				})
			},
			learnMore(){
				uni.navigateTo({
					url: '/pages/guide/guide'
				})
			},
			apply(){
				uni.navigateTo({
					url: '/pages/apply/apply'
				})
			}
		}
	}
</script>

<style>

</style>
