import Vue from 'vue'
import App from './App'

// vuex
import store from './store'

// 引入全局uView
import uView from '@/uni_modules/uview-ui'

Vue.prototype.$store = store

import mixin from './common/mixin'
Vue.mixin(mixin)

Vue.config.productionTip = false

App.mpType = 'app'
Vue.use(uView)

// #ifdef MP
// 引入uView对小程序分享的mixin封装
const mpShare = require('@/uni_modules/uview-ui/libs/mixin/mpShare.js')
Vue.mixin(mpShare)
// #endif


import api from './api'
import util from './common/util'
import config from "./common/config.js"

Vue.prototype.$api = api
Vue.prototype.$util = util
Vue.prototype.$config = config

const app = new Vue({
    store,
    ...App
})

// 引入请求封装
require('./util/request/index')(app)
import request from 'common/request.js'
Vue.prototype.$request = request 

app.$mount()
