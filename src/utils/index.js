export const getFileUrl = path =>
  new URL(`../assets/${path}`, import.meta.url).href

// 时间戳转日期
export const formatDate = dateTime => {
  if (dateTime) {
    const date = new Date(dateTime)

    const Y = date.getFullYear()
    const M = `0${date.getMonth() + 1}`.slice(-2)
    const D = `0${date.getDate()}`.slice(-2)

    return `${Y}-${M}-${D}`
  } else {
    return dateTime
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

export const isPlus = () => +new Date(getPlus()?.expire_date) > Date.now()
