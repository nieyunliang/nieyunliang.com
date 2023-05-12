import { nanoid } from 'nanoid'

const dbName = 'chats'

// indexedDB版本号
function getIndexedDBversion() {
	return Number(localStorage.getItem('indexedDBversion') || 1)
}

// 设置indexedDB版本号
function setIndexedDBVersion(version) {
	localStorage.setItem('indexedDBversion', version)
}

/**
 * 打开数据库
 * @param {number} version 数据库的版本
 * @return {object} 该函数会返回一个数据库实例
 */
function openDB(version = getIndexedDBversion()) {
	return new Promise((resolve, reject) => {
		//  兼容浏览器
		const indexedDB =
			window.indexedDB ||
			window.mozIndexedDB ||
			window.webkitIndexedDB ||
			window.msIndexedDB

		// 打开数据库，若没有则会创建
		const request = indexedDB.open(dbName, version)
		// 数据库打开成功回调
		request.onsuccess = function (event) {
			console.log('数据库打开成功')

			const db = event.target.result // 数据库对象
			resolve(db)
		}
		// 数据库打开失败的回调
		request.onerror = function (event) {
			console.log('数据库打开报错', event)
			reject(event)
		}
		// 数据库有更新时候的回调
		request.onupgradeneeded = function (event) {
			// 数据库创建或升级的时候会触发
			console.log('onupgradeneeded')

			const db = event.target.result // 数据库对象
			setIndexedDBVersion(db.version)
			resolve(db)
		}
	})
}

/**
 * 关闭数据库
 * @param {object} db 数据库实例
 */
function closeDB(db) {
	db.close()
	console.log('数据库已关闭')
}

async function checkoutStore(storeName) {
	const version = getIndexedDBversion()
	const db = await openDB(version)

	const res = db.objectStoreNames.contains(storeName)

	closeDB(db)
	return res
}

/**
 * 创建存储库
 * @param {string} storeName
 * @param {Array} storeKeyArray
 * @returns
 */
async function createStore(storeName, storeKeyArray) {
	const version = getIndexedDBversion()
	const db = await openDB(version + 1)

	// 创建存储库
	const objectStore = db.createObjectStore(storeName, {
		keyPath: 'sequence_id', // 主键
		autoIncrement: true, // 实现自增
	})
	// 创建索引，在后面查询数据的时候可以根据索引查
	objectStore.createIndex('id', 'id', { unique: false })
	objectStore.createIndex('created_time', 'created_time', { unique: false })

	storeKeyArray.forEach(key =>
		objectStore.createIndex(key, key, { unique: false })
	)

	closeDB(db)
	return true
}

//删除存储库
async function deleteStore(storeName) {
	const version = getIndexedDBversion()
	const db = await openDB(version + 1)

	const contains = db.objectStoreNames.contains(storeName)

	if (contains) {
		db.deleteObjectStore(storeName)
	}
	closeDB(db)
}

/**
 * 新增数据
 * @param {string} storeName 仓库名称
 * @param {string} data 数据
 */
async function insertData(storeName, data) {
	const db = await openDB()
	return new Promise((resolve, reject) => {
		const _data = { ...data, id: nanoid(), created_time: Date.now() }
		const request = db
			.transaction([storeName], 'readwrite') // 事务对象 指定表格名称和操作模式（"只读"或"读写"）
			.objectStore(storeName) // 仓库对象
			.add(_data)

		request.onsuccess = function () {
			console.log('数据写入成功')
			closeDB(db)
			resolve(_data)
		}

		request.onerror = function () {
			console.log('数据写入失败')
			reject(false)
		}
	})
}

/**
 * 通过索引读取数据
 * @param {string} storeName 仓库名称
 * @param {string} indexName 索引名称
 * @param {string} indexValue 索引值
 */
async function getDataByIndex(storeName, indexName, indexValue) {
	const db = await openDB()
	const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
	const request = store.index(indexName).get(indexValue)
	request.onerror = function () {
		console.log('事务失败')
	}
	request.onsuccess = function (e) {
		const result = e.target.result
		console.log('索引查询结果：', result)
	}
}

/**
 * 通过游标读取数据
 * @param {string} storeName 仓库名称
 */
async function cursorGetData(storeName) {
	const db = await openDB()
	const store = db
		.transaction(storeName, 'readwrite') // 事务
		.objectStore(storeName) // 仓库对象

	return new Promise(resolve => {
		const list = []
		const request = store.openCursor() // 指针对象
		// 游标开启成功，逐行读数据
		request.onsuccess = function (e) {
			const cursor = e.target.result
			if (cursor) {
				// 必须要检查
				list.push(cursor.value)
				cursor.continue() // 遍历了存储对象中的所有内容
			} else {
				console.log('游标读取的数据：', list)
				closeDB(db)
				resolve(list)
			}
		}
	})
}

/**
 * 通过索引和游标删除指定的数据
 * @param {string} storeName 仓库名称
 * @param {string} indexName 索引名
 * @param {object} indexValue 索引值
 */
async function cursorDelete(storeName, indexName, indexValue) {
	const db = await openDB()
	const store = db.transaction(storeName, 'readwrite').objectStore(storeName)

	return new Promise((resolve, reject) => {
		const request = store
			.index(indexName) // 索引对象
			.openCursor(IDBKeyRange.only(indexValue)) // 指针对象

		request.onsuccess = function (e) {
			const cursor = e.target.result
			let deleteRequest
			if (cursor) {
				deleteRequest = cursor.delete() // 请求删除当前项
				deleteRequest.onerror = function () {
					console.log('游标删除该记录失败')
				}
				deleteRequest.onsuccess = function () {
					console.log('游标删除该记录成功')
					closeDB(db)
					resolve(true)
				}
				cursor.continue()
			}
		}
		request.onerror = function (e) {
			reject(e)
		}
	})
}

export {
	checkoutStore,
	createStore,
	deleteStore,
	insertData,
	cursorGetData,
	cursorDelete,
}
