import request from "../common/request.js"
import config from "common/config.js"

export const login = (params) => {
	return request.get('/login', params)
}

export const wxDecodeUser = (data) => {
	return request.post('/wx/decode/user', data)
}

export const wxDecodePhone = (data) => {
	return request.post('/wx/decode/phone', data)
}

