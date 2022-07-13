import request from "../common/request.js"

export const saveFeedback = (data) => {
	return request.post('/feedback/save',data)
}

