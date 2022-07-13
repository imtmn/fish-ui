import request from "../common/request.js"

export function SaveApplicationForm(data) {
  return request.post('/store/apply', data)
}
export function GetApplicationForm() {
  return request.get('/store/apply')
}

export function GetStore(storeId) {
	if (storeId) {
		return request.get('/store/' + storeId)
	} else {
		return request.get('/store')
	}
}

export function SaveStore(data) {
  return request.post('/store/save', data)
}

export function GenerateInviteCode() {
  return request.get('/store/code')
}

export function JoinStore(data) {
  return request.get('/store/join', data)
}

