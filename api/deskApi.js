import request from "../common/request.js"

export const findDesk = () => {
	return request.get('/desk',{page:1,size:100})
}

export const getDesk = (id) => {
	return request.get('/desk/'+id)
}

export const deleteDesk = (id) => {
	return request.del('/desk/'+id)
}

export const saveDesk = (data) => {
	return request.post('/desk/save',data)
}

export const getDeskQrcode = (id) => {
	return request.get('/desk/qrcode/'+id)
}