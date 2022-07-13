export const getOrderStatusName = (status) =>{
	if(status == 'normal'){
		return '待支付'
	} else if (status == 'pay'){
		return '已支付'
	} else if (status == 'cancel'){
		return '已取消'
	} else if (status == 'complete'){
		return '已完成'
	} 
	return ''
}

export const getOrderStatusColor = (status) =>{
	if(status == 'normal'){
		return '#f29100'
	} else if (status == 'pay'){
		return '#19be6b'
	} else if (status == 'cancel'){
		return '#909399'
	} else if (status == 'complete'){
		return '#2979ff'
	} 
	return '#909399'
}