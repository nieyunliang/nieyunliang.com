import { Fragment, useLayoutEffect, useState } from 'react'
import styles from './index.module.less'
import { Input, Layout, Image, ConfigProvider, Space, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { SessionList } from '@/dataBase'
import {
	checkoutStore,
	createStore,
	deleteStore,
	insertData,
	cursorGetData,
} from '@/dataBase/indexedDB'
import ChatGPTHeader from '@/assets/chatgpt-icon.svg'
import UserHeader from '@/assets/user-header.svg'
import SendIcon from '@/assets/send.svg'
import Sessions from './Sessions'

const { Sider, Content, Footer } = Layout
export default function ChatAI() {
	const [storeName, setStoreName] = useState('') //当前会话对应的storeName
	const [messages, setMessages] = useState([])
	const [message, setMessage] = useState('')

	useLayoutEffect(() => {
		const messagesBoxDom = document.getElementById('messages-box')
		messagesBoxDom.scrollTo({
			top: messagesBoxDom.lastChild?.offsetTop ?? 0,
			behavior: 'smooth',
		})
	}, [messages])

	const [loading, setLoading] = useState(false)
	const sendMessage = _messages => {
		fetch(`/api/send_message`, {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({
				messages: _messages,
			}),
		})
			.then(response => response.json())
			.then(async ({ choices = [] }) => {
				const { message } = choices[0]
				const msg = await saveMessagesLocal(storeName, message)
				setMessages(_messages => [..._messages, { ...msg }])
			})
			.catch(err => {
				console.log(err)
				setMessages(_messages => [
					..._messages,
					{ role: 'assistant', content: '哎呀，服务器出问题啦！' },
				])
			})
			.finally(() => {
				setLoading(false)
			})
	}

	// 保存数据到本地
	const saveMessagesLocal = async (_storeName, data) => {
		_storeName = _storeName || `chat_${Date.now()}`

		const checkoutStoreRes = await checkoutStore(_storeName)
		console.log(`是否包含存储对象${_storeName}:${checkoutStoreRes}`)

		if (checkoutStoreRes) {
			return await insertData(_storeName, data)
		} else {
			const createRes = await createStore(_storeName, ['role', 'content'])

			if (createRes) {
				const sessionList = new SessionList()
				await sessionList.addData({
					store_name: _storeName,
					title: data.content,
				})

				return await insertData(_storeName, data)
			}
		}
	}

	//	发送消息处理
	const send = async () => {
		if (!message) return
		setLoading(true)

		const _message = await saveMessagesLocal(storeName, {
			role: 'user',
			content: message,
		})

		const _messages = [...messages, _message]
		setMessages(_messages)
		sendMessage(_messages)
		setMessage('')
	}

	//	获取当前会话聊天记录
	const getCurrentSession = async storeName => {
		setStoreName(storeName)
		const res = await cursorGetData(storeName)

		if (Array.isArray(res)) {
			setMessages(res)
		}
	}

	// 初始化新的会话
	const onNewSession = async storeName => {
		setStoreName(storeName)
		setMessages([])
		await createStore(storeName, ['role', 'content'])
	}

	// 删除会话数据
	const onRemoveSession = async _storeName => {
		setStoreName('')
		setMessages([])
		await deleteStore(_storeName)
	}

	const formatDate = timestamp => {
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

	const formatContent = (content = '') => {
		const includeCode = content.indexOf('```')

		if (~includeCode) {
			content = content.replace(/```/g, '')
		}
		return content
	}

	return (
		<div className={styles.container}>
			<Layout>
				<Sider>
					<Sessions
						onSessionChange={getCurrentSession}
						onNewSession={onNewSession}
						onRemoveSession={onRemoveSession}
					/>
				</Sider>
				<Layout>
					<Content>
						<div
							id='messages-box'
							className={styles['messages-box']}
						>
							{messages.map((msg, i) => (
								<Fragment key={i}>
									{msg.role === 'assistant' ? (
										<div className={styles['message-item']}>
											<Space className={styles.sender}>
												<Image
													width={30}
													src={ChatGPTHeader}
												/>
												<div>{formatDate(msg.created_time)}</div>
											</Space>
											<pre className={styles.bubble}>
												{formatContent(msg.content)}
											</pre>
										</div>
									) : (
										<div
											className={`${styles['message-item']} ${styles.right}`}
										>
											<Space className={styles.sender}>
												<div>{formatDate(msg.created_time)}</div>
												<Image
													width={30}
													src={UserHeader}
												/>
											</Space>
											<div className={styles.bubble}>{msg.content}</div>
										</div>
									)}
								</Fragment>
							))}

							{loading && (
								<div style={{ textAlign: 'center' }}>
									<Spin
										indicator={
											<LoadingOutlined
												style={{ fontSize: 24 }}
												spin
											/>
										}
									/>
								</div>
							)}
						</div>
					</Content>
					<Footer>
						<div className={styles['input-box']}>
							<ConfigProvider
								theme={{
									token: {
										colorPrimary: '#11a37f',
									},
								}}
							>
								<Input
									size='large'
									value={message}
									suffix={
										<img
											alt=''
											className={styles['btn-send']}
											src={SendIcon}
											onClick={() => {
												!loading && send()
											}}
										/>
									}
									onChange={e => setMessage(e.target.value)}
									onKeyUp={e => {
										if (e.key === 'Enter') !loading && send()
									}}
								/>
							</ConfigProvider>
						</div>
					</Footer>
				</Layout>
			</Layout>
		</div>
	)
}
