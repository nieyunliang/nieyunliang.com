import 'highlight.js/styles/base16/material-darker.css'
import style from './index.module.less'
import { useState } from 'react'
import { useReactive, useBoolean, useUpdateEffect } from 'ahooks'
import { Input, Layout, ConfigProvider } from 'antd'
import { isMobile } from '@/utils'
import {
	checkoutStore,
	createStore,
	insertData,
	cursorGetData,
} from '@/database/indexedDB'
import { SessionList } from '@/database'
import SendIcon from '@/assets/send.svg'
import Sessions from './components/sessions'
import Messages from './components/messages/messages'
import sendMessageGPT from '../../utils/sendMessageGPT'

const { Sider, Content, Footer } = Layout

export default function ChatAI() {
	const getNewStoreName = () => `chat_${Date.now()}`

	const [refreshSessionList, setRefreshSessionList] = useState(true)
	const [storeName, setStoreName] = useState(getNewStoreName()) //当前会话对应的storeName
	const [message, setMessage] = useState('')
	const [errMessage, setErrMessage] = useState('')
	let messages = useReactive([])

	const [loading, { setTrue: openLoading, setFalse: closeLoading }] =
		useBoolean(false)

	const initChatList = () => {
		setStoreName(getNewStoreName())
		setErrMessage('')
		messages.length = 0
	}

	const messagesBoxDom = document.getElementById('messages-box')
	const lastMessageDom = messagesBoxDom?.lastChild
	// 页面滚动
	useUpdateEffect(() => {
		const offsetTop = lastMessageDom?.offsetTop
		const height = lastMessageDom?.offsetHeight
		messagesBoxDom.scrollTo({
			top: offsetTop + height ?? 0,
			behavior: 'smooth',
		})
	}, [lastMessageDom?.offsetHeight])

	const sendMessage = _messages => {
		sendMessageGPT(_messages)
			.then(async res => {
				if (res.message) {
					setErrMessage(`服务器出错了！[${res.name}: ${res.message}]`)
					return
				}

				const { id, role, content, created_time } = await saveMessagesLocal(
					res.choices[0].message
				)
				messages.push({ id, role, created_time, content: '' })

				const length = content.length
				const lastMessage = messages.at(-1)
				for (let i = 0; i < length; i++) {
					requestIdleCallback(() => {
						lastMessage.content += content.at(i)
					})
				}
			})
			.catch(() => {
				setErrMessage('请求出错了！')
			})
			.finally(() => {
				closeLoading()
			})
	}

	// 保存数据到本地
	const saveMessagesLocal = async data => {
		const _storeName = storeName || getNewStoreName()

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

				setRefreshSessionList(true) //创建会话，刷新会话列表
				setStoreName(_storeName)

				return await insertData(_storeName, data)
			}
		}
	}

	//	发送消息处理
	const send = async () => {
		if (loading || !message) return
		openLoading()

		const _message = await saveMessagesLocal({
			role: 'user',
			content: message,
		})

		messages.push(_message)
		setMessage('')
		sendMessage([...messages])
	}

	//	获取当前会话聊天记录
	const getCurrentSession = async _storeName => {
		if (_storeName === storeName) return
		setStoreName(_storeName)
		setErrMessage('')
		messages.length = 0

		const _messages = await cursorGetData(_storeName)
		if (Array.isArray(_messages)) {
			messages.push(..._messages)
		}
	}

	return (
		<Layout style={{ height: '100vh' }}>
			{!isMobile() && (
				<Sider width={260}>
					<Sessions
						loading={loading}
						refresh={refreshSessionList}
						onRefreshFinish={() => setRefreshSessionList(false)}
						onSessionChange={getCurrentSession}
						onNewSession={initChatList}
						onRemoveSession={initChatList}
					/>
				</Sider>
			)}
			<Layout>
				<Content>
					<Messages
						messages={messages}
						loading={loading}
						error={errMessage}
					/>
				</Content>
				<Footer>
					<div className={style['input-box']}>
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
										className={style['btn-send']}
										src={SendIcon}
										onClick={send}
									/>
								}
								onChange={e => setMessage(e.target.value)}
								onKeyUp={e => {
									if (e.key === 'Enter') send()
								}}
							/>
						</ConfigProvider>
					</div>
				</Footer>
			</Layout>
		</Layout>
	)
}
