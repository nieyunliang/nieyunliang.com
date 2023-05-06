import {Fragment, useEffect, useState} from 'react'
import style from './index.module.less'
import {Input, Layout, Image, ConfigProvider, Space, Spin} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import {SessionList} from '@/dataBase'
import {formatDate} from '@/utils'
import {
	checkoutStore,
	createStore,
	deleteStore,
	insertData,
	cursorGetData,
} from '@/dataBase/indexedDB'
import ChatGPTLogo from '@/assets/chatgpt-logo.svg'
import ChatGPTHeader from '@/assets/chatgpt-icon.svg'
import UserHeader from '@/assets/user-header.svg'
import SendIcon from '@/assets/send.svg'
import Sessions from './Sessions'

const {Sider, Content, Footer} = Layout
export default function ChatAI() {
	const [storeName, setStoreName] = useState(`chat_${Date.now()}`) //当前会话对应的storeName
	const [messages, setMessages] = useState([])
	const [message, setMessage] = useState('')

	const getNewStoreName = () => `chat_${Date.now()}`
	const initChatList = () => {
		setStoreName(getNewStoreName())
		setMessages([])
	}

	// 页面滚动
	useEffect(() => {
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
			headers: {'Content-type': 'application/json'},
			body: JSON.stringify({
				messages: _messages,
			}),
		})
			.then(response => response.json())
			.then(async res => {
				const choices = res.choices
				const message = res.message
					? {
						role: 'assistant',
						content: `哎呀，服务器出问题啦！[${res.name}: ${res.message}]`,
					}
					: choices[0].message

				const msg = await saveMessagesLocal(message)
				setMessages(_messages => [..._messages, {...msg}])
			})
			.catch(err => {
				console.log(err)
				setMessages(_messages => [
					..._messages,
					{role: 'assistant', content: '哎呀，请求出错啦！'},
				])
			})
			.finally(() => {
				setLoading(false)
			})
	}

	const [refreshSessionList, setRefreshSessionList] = useState(true)
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

				setRefreshSessionList(true) //第一次创建会话，需要刷新会话列表
				setStoreName(_storeName)

				return await insertData(_storeName, data)
			}
		}
	}

	//	发送消息处理
	const send = async () => {
		if (!message) return
		setLoading(true)

		const _message = await saveMessagesLocal({
			role: 'user',
			content: message,
		})

		const _messages = [...messages, _message]
		sendMessage(_messages)
		setMessages(_messages)
		setMessage('')
	}

	//	获取当前会话聊天记录
	const getCurrentSession = async _storeName => {
		setStoreName(_storeName)
		const res = await cursorGetData(_storeName)

		if (Array.isArray(res)) {
			setMessages(res)
		}
	}

	// 初始化新的会话
	const onNewSession = async _storeName => {
		setStoreName(_storeName)
		setMessages([])
		await createStore(_storeName, ['role', 'content'])
	}

	// 删除会话数据
	const onRemoveSession = async _storeName => {
		initChatList()
		await deleteStore(_storeName)
	}

	const formatContent = (content = '') => {
		const includeCode = content.indexOf('```')

		if (~includeCode) {
			content = content.replace(/```/g, '')
		}
		return content
	}

	return (
		<Layout style={{height: '100vh'}}>
			<Sider width={260}>
				<Sessions
					refresh={refreshSessionList}
					onRefreshFinish={() => setRefreshSessionList(false)}
					onSessionChange={getCurrentSession}
					onNewSession={onNewSession}
					onRemoveSession={onRemoveSession}
				/>
			</Sider>
			<Layout>
				<Content>
					<div
						id='messages-box'
						className={style['messages-box']}
					>
						{messages.map((msg, i) => (
							<Fragment key={i}>
								{msg.role === 'assistant' ? (
									<div className={style['message-item']}>
										<Space className={style.sender}>
											<Image
												width={30}
												src={ChatGPTHeader}
											/>
											<div>{formatDate(msg.created_time)}</div>
										</Space>
										<pre className={style.bubble}>
												{formatContent(msg.content)}
											</pre>
									</div>
								) : (
									<div
										className={`${style['message-item']} ${style.right}`}
									>
										<Space className={style.sender}>
											<div>{formatDate(msg.created_time)}</div>
											<Image
												width={30}
												src={UserHeader}
											/>
										</Space>
										<div className={style.bubble}>{msg.content}</div>
									</div>
								)}
							</Fragment>
						))}

						{loading && (
							<div style={{textAlign: 'center'}}>
								<Spin
									indicator={
										<img src={ChatGPTLogo} className={style.loading}/>
									}
								/>
							</div>
						)}
					</div>
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
	)
}
