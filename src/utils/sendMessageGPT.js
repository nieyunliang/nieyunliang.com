export default function sendMessageGPT(messages) {
	return new Promise((resolve, reject) => {
		fetch(`/api/send_message`, {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({
				messages,
			}),
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
