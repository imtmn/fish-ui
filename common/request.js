// request.js
import config from "common/config.js"
import { showToast } from '@/common/util.js'
//const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl : config.prodUrl
const baseUrl = config.prodUrl
const uRLWhiteningList  = ['/login']
const request = (options = {}) => {
	console.info(baseUrl+"  "+options.url)
	const token = getApp().globalData.token
	if(!token && uRLWhiteningList.indexOf(options.url) < 0){
		showToast('授权登录失败，请重试');
		return
	}
	const header = options.header || {}
	if(token){
		header['Authorization'] = 'Bearer ' + token
	}
    return new Promise((resolve, reject) => {
        uni.request({
            url: baseUrl + options.url || '',
            method: options.method || 'GET',
            data: options.data || {},
            header: header      
        }).then(data => {
            let [err, res] = data;
            resolve(res.data);
        }).catch(error => {
            reject(error)
        })
    });
}

const get = (url, data, options = {}) => {
    options.method = 'GET';
    options.data = data;
    options.url = url;
    return request(options)
}

const del = (url, data, options = {}) => {
    options.method = 'DELETE';
    options.data = data;
    options.url = url;
    return request(options)
}

const post = (url, data, options = {}) => {
    options.method = 'POST';
    options.data = data;
    options.url = url;
    return request(options)
}

const uploadFile = (obj) =>{
	console.info("uploadFile:"+baseUrl+"  "+obj.url)
	const token = getApp().globalData.token
	if(!token && uRLWhiteningList.indexOf(obj.url) < 0){
		showToast('授权登录失败，请重试');
		return
	}
	const header = obj.header || {}
	if(token){
		header['Authorization'] = 'Bearer ' + token
	}
	uni.uploadFile({
		url: baseUrl + obj.url || '', 
		filePath: obj.filePath,
		name: obj.name,
		formData: obj.formData,
		header: header,
		success: res => {
			console.info(res)
		    typeof obj.success == "function" && obj.success(res.data)
		},
		fail: res => {
			console.error(res)
		    typeof obj.fail == "function" && obj.fail(res)
		}
	});
}

export default  {
    request,
    get,
    post,
	del,
	uploadFile
}