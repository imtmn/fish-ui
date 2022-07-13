import request from "../common/request.js"

export const saveOrder = (entity) => {
	return request.post('/order/save',entity)
}


export const findOrderPage = (params) => {
	return request.get('/order',params)
}

export const getOrder = (id) => {
	return request.get('/order/' + id)
}


export const cancelOrder = (id) => {
	return request.get('/order/cancel/' + id)
}

export const recoverOrder = (id) => {
	return request.get('/order/recover/' + id)
}

export const payOrder = (params) => {
	return request.get('/order/pay', params)
}


export const countTodayOrder = () => {
	return request.get('/order/count/today')
}


export const getTodayIncome = () => {
	return request.get('/order/income/today')
}

