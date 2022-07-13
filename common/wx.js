import { login } from '@/api/sysApi.js';
import { showToast } from '@/common/util.js'

async function wxLogin(){
	const setting = wx.getSetting()
	console.info(setting)
	const info = wx.getUserInfo()
	console.info(info)
}


async function getToken(nickName,avatarUrl) {
	const {code} = await wx.login();
	console.info("code = "+ code)
	if(!code){
		showToast('授权登录失败，请重试');
		return
	}
	const repo = await login({ code:code,nickName:nickName,avatarUrl:avatarUrl });
	if(repo && repo.code == 200){
		console.info('token 获取成功 = ' + repo.token)
		return repo.token
	}
	return null
}

module.exports = {
	getToken: getToken,
	wxLogin: wxLogin
};
