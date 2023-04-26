import {
	checkoutStore,
	createStore,
	insertData,
	cursorGetData,
	cursorDelete,
} from './indexedDB'

export class SessionList {
	constructor() {
		this.storeName = 'store_session_list'
	}

	async get() {
		const checkoutRes = await checkoutStore(this.storeName)

		if (!checkoutRes) {
			await this.createSessionListStore()
			return []
		}

		return cursorGetData(this.storeName)
	}

	async createSessionListStore() {
		const checkoutRes = await checkoutStore(this.storeName)

		if (!checkoutRes) {
			return await createStore(this.storeName, ['store_name', 'title'])
		}
	}

	async addData(data) {
		return await insertData(this.storeName, data)
	}

	async removeData(id) {
		return await cursorDelete(this.storeName, 'id', id)
	}
}
