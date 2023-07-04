export const getFileUrl = path =>
	new URL(`../assets/${path}`, import.meta.url).href

// 时间戳转日期
export const formatDate = timestamp => {
	if (Number.isInteger(timestamp)) {
		const date = new Date(timestamp)

		const Y = date.getFullYear()
		const M = date.getMonth() + 1
		const D = date.getDate()
		const h = date.getHours()
		const m = date.getMinutes()
		const s = date.getSeconds()

		return `${Y}-${M}-${D} ${h}:${m}:${s}`
	} else {
		return timestamp
	}
}

// 设备信息-iPhone或者Android
export const isMobile = () => {
	const { userAgent } = window.navigator
	return !!~userAgent.indexOf('iPhone') || !!~userAgent.indexOf('Android')
}
