import 'highlight.js/styles/base16/material-darker.css'
import style from './index.module.less'
import { Fragment, useEffect, useState } from 'react'
import { Input, Layout, Image, ConfigProvider, Space } from 'antd'
import hljs from 'highlight.js'
import { Marked } from 'marked'
import { mangle } from 'marked-mangle'
import { markedHighlight } from 'marked-highlight'
import { gfmHeadingId } from 'marked-gfm-heading-id'
import { SessionList } from '@/dataBase'
import { formatDate, isMobile } from '@/utils'
import {
	checkoutStore,
	createStore,
	insertData,
	cursorGetData,
} from '@/dataBase/indexedDB'
import ChatGPTHeader from '@/assets/chatgpt-icon.svg'
import UserHeader from '@/assets/user-header.svg'
import SendIcon from '@/assets/send.svg'
import Sessions from './Sessions'

const { Sider, Content, Footer } = Layout

const parsePack = str => {
	// 定义正则表达式匹配模式
	const pattern = /data:\s*({.*?})\s*\n/g
	// 定义一个数组来存储所有匹 配到的 JSON 对象
	const result = []
	// 使用正则表达式匹配完整的 JSON 对象并解析它们
	let match
	while ((match = pattern.exec(str)) !== null) {
		const jsonStr = match[1]
		try {
			const json = JSON.parse(jsonStr)
			result.push(json)
		} catch (e) {
			console.log(e)
		}
	}
	// 输出所有解析出的 JSON 对象
	return result
}

export default function ChatAI() {
	const getNewStoreName = () => `chat_${Date.now()}`

	const [storeName, setStoreName] = useState(getNewStoreName()) //当前会话对应的storeName
	const [messages, setMessages] = useState([])
	const [message, setMessage] = useState('')

	const initChatList = () => {
		setStoreName(getNewStoreName())
		setMessages([])
	}

	const messagesBoxDom = document.getElementById('messages-box')
	const lastMessageDom = document.getElementById('last-message')
	const lastMessageDomHeight = lastMessageDom?.offsetHeight
	// 页面滚动
	useEffect(() => {
		if (messages.length || lastMessageDomHeight) {
			const offsetTop = messagesBoxDom.lastChild?.offsetTop
			const height = messagesBoxDom.lastChild?.offsetHeight
			messagesBoxDom.scrollTo({
				top: offsetTop + height ?? 0,
				behavior: 'smooth',
			})
		}
	}, [messages, lastMessageDomHeight])

	const [loading, setLoading] = useState(false)

	const [lastIndexMessage, setLastIndexMessage] = useState(null)
	const sendMessage = _messages => {
		setLastIndexMessage({ role: 'assistant', content: '' })

		fetch(`/api/send_message`, {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({
				messages: _messages,
			}),
		})
			.then(response => response.json())
			.then(async res => {
				if (res.message) {
					setLastIndexMessage({
						role: 'assistant',
						content: `服务器出错啦！[${res.name}: ${res.message}]`,
					})
					return
				}

				const datas = parsePack(res)
				const length = datas.length

				for (let i = 0; i < length; i++) {
					requestIdleCallback(() => {
						const data = datas[i]
						const { delta, finish_reason } = data.choices[0]

						const { content = '', role } = delta

						setLastIndexMessage(state => {
							const newState = { ...state }
							Object.assign(newState, {
								content: (newState?.content ?? '') + content,
								created_time: data.created,
							})

							if (role) {
								Object.assign(newState, { role })
							}

							if (finish_reason === 'stop') {
								Object.assign(newState, { finish_reason })
							}
							return newState
						})
					})
				}
			})
			.catch(() => {
				setMessages(_messages => [
					..._messages,
					{ role: 'assistant', content: '哎呀，请求出错啦！' },
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

				setRefreshSessionList(true) //创建会话，刷新会话列表
				setStoreName(_storeName)

				return await insertData(_storeName, data)
			}
		}
	}

	// 回答完成，保存数据
	const answerFinish = async () => {
		const msg = await saveMessagesLocal(lastIndexMessage)
		setMessages(_messages => [..._messages, { ...msg }])
		setLastIndexMessage(null)
	}
	useEffect(() => {
		if (lastIndexMessage?.finish_reason === 'stop') {
			answerFinish()
		}
	}, [lastIndexMessage?.finish_reason])

	//	发送消息处理
	const send = async () => {
		if (loading || !message) return
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
		if (_storeName === storeName) return
		setStoreName(_storeName)
		const data = await cursorGetData(_storeName)

		if (Array.isArray(data)) {
			setMessages(data)
		}
	}

	const marked = new Marked(
		markedHighlight({
			langPrefix: 'hljs language-',
			highlight(code) {
				if (code) {
					try {
						// 使用 highlight.js 对代码进行高亮显示
						return hljs.highlightAuto(code).value
					} catch (error) {
						console.log(error)
					}
				}
			},
		})
	)
	marked.use(mangle())
	marked.use(gfmHeadingId({ prefix: 'my-prefix-' }))
	const formatContent = (content = '') => ({
		__html: marked.parse(content),
	})

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
					<div
						id='messages-box'
						className={style['messages-box']}
					>
						{messages.map(msg => (
							<Fragment key={msg.id}>
								{msg.role === 'assistant' ? (
									<div className={style['message-item']}>
										<Space className={style.sender}>
											<Image
												width={30}
												src={ChatGPTHeader}
											/>
											<div>{formatDate(msg.created_time)}</div>
										</Space>
										<div className={style.bubble}>
											<pre
												dangerouslySetInnerHTML={formatContent(msg.content)}
											/>
										</div>
									</div>
								) : (
									<div className={`${style['message-item']} ${style.right}`}>
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

						{lastIndexMessage ? (
							<div
								id='last-message'
								className={style['message-item']}
							>
								<Space className={style.sender}>
									<Image
										width={30}
										src={ChatGPTHeader}
									/>
									<div>{formatDate(lastIndexMessage.created_time)}</div>
								</Space>
								<div className={style.bubble}>
									<pre
										dangerouslySetInnerHTML={formatContent(
											lastIndexMessage.content
										)}
									></pre>
									{loading ? <span className={style.cursor}>|</span> : null}
								</div>
							</div>
						) : null}
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
