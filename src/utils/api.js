import { getPlus } from './index'

export function sendMessageGPT(messages) {
  const plus = getPlus()
  return new Promise((resolve, reject) => {
    fetch(`${import.meta.env.VITE_APP_API_URL}/send_message`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        account: plus?.account,
        messages
      })
    })
      .then(response => response.json())
      .then(async res => {
        resolve(res)
      })
      .catch(() => {
        reject()
      })
  })
}

export function getVipState(account = '') {
  return new Promise((resolve, reject) => {
    fetch(`${import.meta.env.VITE_APP_API_URL}/vip_state`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        account
      })
    })
      .then(response => response.json())
      .then(async res => {
        resolve(res)
      })
      .catch(() => {
        reject()
      })
  })
}
