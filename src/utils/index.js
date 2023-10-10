export const getFileUrl = path =>
  new URL(`../assets/${path}`, import.meta.url).href

// 时间戳转日期
export const formatDate = timestamp => {
  if (Number.isInteger(timestamp)) {
    const date = new Date(timestamp)

    const Y = date.getFullYear()
    const M = `0${date.getMonth() + 1}`.slice(-2)
    const D = `0${date.getDate() + 1}`.slice(-2)
    const h = date.getHours()
    const m = `0${date.getMinutes()}`.slice(-2)
    const s = `0${date.getSeconds()}`.slice(-2)

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

// 查询plus账号
export const getPlus = () => {
  const plus = localStorage.getItem('plus')
  return plus ? JSON.parse(plus) : null
}
