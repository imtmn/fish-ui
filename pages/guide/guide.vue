<template>
	<view>
		<view class="swiper-css zqui-rel" :style="{ height: hpx }">
			<swiper class="swiper" :style="{ height: hpx }" :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval" @change="changeTab" next-margin="50rpx">
				<swiper-item class="flex1" v-for="(item, index) in imageList" :key="index">
					<view class="flex-column title-box">
						<view class="guide-title">{{item.name}}</view>
						<view class="guide-subtitle">{{item.subtitle}}</view>
					</view>
					<image class="flex-column image-size" mode="aspectFit" :src="item.src" />
				</swiper-item>
			</swiper>
			<!-- 按钮样式切换 -->
			<template v-if="cur != 2">
				<view class=" flex-column dots">
					<block v-for="(item,index) in imageList" :key="index">
						<view class="dot" :class="{'active':  index == cur}"></view>
					</block>
				</view>
			</template>
			<!-- 第三张图使用按钮《立即进入》 -->
			<template v-if="cur == 2">
				<!-- <button class="flex-column cu-btn footer" @click="launchApp">返回</button> -->
			</template> 
			<!-- 右上角跳过按钮 -->
			<view class="btn-box" @click="launchApp"><text class="passbtn">{{cur == 2 ?'立即进入':'跳过'}}</text></view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				//修改图片,文字描述
				imageList: [{
						name: '完全免费',
						subtitle: '小程序所有功能均免费使用，无需担心高额费率',
						src: 'https://fish-helper.oss-cn-guangzhou.aliyuncs.com/static/guide/guide1.png'
					},
					{
						name: '私域流量',
						subtitle: '用户与商家对应，用户扫码后才能看到店铺菜单，无需担心客户流失和恶意竞争',
						src: 'https://fish-helper.oss-cn-guangzhou.aliyuncs.com/static/guide/guide2.png'
					},
					{
						name: '持续优化',
						subtitle: '功能不断迭代和完善中，如果您有什么需求或宝贵建议，可以随时反馈给我们',
						src: 'https://fish-helper.oss-cn-guangzhou.aliyuncs.com/static/guide/guide3.png'
					}
				],
				indicatorDots: false,
				autoplay: false,
				interval: 10000,
				duration: 500,
				iStatusBarHeight: '0px',
				hpx: '100%',
				cur: 0,
				dotsStyles: ''
			};
		},
		onLoad() {
			let that = this;
			// plus.navigator.closeSplashscreen();
			uni.getSystemInfo({
				success: function(res) {
					that.hpx = res.windowHeight + 'px';
				}
			});
		},
		methods: {
			launchApp() {
				uni.navigateBack({
					delta:1
				})
			},
			changeTab(e){
				this.cur = e.detail.current
			}
		}
	};
</script>

<style lang="scss">
	page {
		background-color: #FFFFFF;
		min-height: 100%;
		height: 100%;
	}

	.guide {
		flex-direction: column;
		flex: 1;
	}

	.flex1 {
		flex: 1;
		width: 100%;
		height: 100%;
	}

	.image-size {
		width: 630rpx;
		height: 600rpx;
		margin-left: 60rpx;
	}

	.title-box {
		padding: 120rpx 0 120rpx 64rpx;
	}

	.guide-title {
		font-size: 48rpx;
		font-weight: bold;
		color: rgba(58, 61, 68, 1);
	}

	.guide-subtitle {
		margin-top: 20rpx;
		font-size: 35rpx;
		color: rgba(131, 136, 146, 1);
		line-height: 50rpx;
	}

	.footer {
		width: 231rpx;
		height: 80rpx;
		text-align: center;
		position: fixed;
		bottom: 116rpx;
		left: 37%;
		font-size: 30rpx;
		color: #FFFFFF;
		background-color: #2B9939;
	}

	.btn-box {
		position: absolute;
		z-index: 999;
		right: 40rpx;
		top: 20rpx;
	}

	.dots {
		display: flex;
		justify-content: center;
		position: absolute;
		z-index: 999;
		height: 151rpx;
		left: 0;
		right: 0;
		bottom: 20rpx;
	}

	.passbtn {
		color: #838892;
		text-align: center;
		border-width: 1rpx;
		border-color: rgba(0, 0, 0, 0.5);
		border-style: solid;
		border-radius: 30rpx;
		font-size: 28rpx;
		padding-top: 10rpx;
		padding-bottom: 10rpx;
		padding-left: 25rpx;
		padding-right: 25rpx;
	}

	.dot {
		margin: 0 4rpx;
		width: 15rpx;
		height: 15rpx;
		background: #CDD2DD;
		border-radius: 8rpx;
		transition: all .6s;
	}

	.dot.active {
		width: 40rpx;
		background: #838892 !important;
	}

	/* 相对定位 */
	.zqui-rel {
		position: relative;
	}

	.swiper-css {
		width: 750rpx;
	}

	.swiper-item {
		width: 750rpx;
	}
</style>
