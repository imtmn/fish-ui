import request from "../common/request.js"

export const saveUser = (entity) => {
	return request.post('/user/save',entity)
}

export const findStoreUser = () => {
	return request.get('/user/store',)
}

export const getUser = () => {
	return request.get('/user')
}

export const removeUser = (userId) => {
	let options = {}
	options.method = 'DELETE';
	options.url = '/user/remove/'+userId;
	return request.request(options)
}

export const changeRole = (params) => {
	return request.get('/user/role',params)
}