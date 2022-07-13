import request from "../common/request.js"

export const findGoodsGroups = (params) => {
	return request.get('/goods/groups',params)
}

export const findGoodsType = () => {
	return request.get('/goodsType')
}

export const goodsStatusOff = (id) => {
	return request.get('/goods/off/' + id)
}

export const goodsStatusOn = (id) => {
	return request.get('/goods/on/' + id)
}

export const countGoods = () => {
	return request.get('/goods/count')
}



export const uploadFile = (obj) => {
	return request.uploadFile(obj)
}