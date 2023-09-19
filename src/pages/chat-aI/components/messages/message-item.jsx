import 'highlight.js/styles/base16/material-darker.css'
import hljs from 'highlight.js'
import { Marked } from 'marked'
import { mangle } from 'marked-mangle'
import { markedHighlight } from 'marked-highlight'
import { gfmHeadingId } from 'marked-gfm-heading-id'

import { Space, Image } from 'antd'

import { formatDate } from '@/utils'
import UserHeader from '@/assets/user-header.svg'
import ChatGPTHeader from '@/assets/chatgpt-icon.svg'
import style from './index.module.less'

function ContentComponent({ content }) {
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
	const formatContent = (_content = '') => ({
		__html: marked.parse(_content),
	})

	return <pre dangerouslySetInnerHTML={formatContent(content)} />
}

function AssistantComponent({ message }) {
	return (
		<div className={style['message-item']}>
			<Space className={style.sender}>
				<Image
					width={30}
					src={ChatGPTHeader}
				/>
				<div>{formatDate(message.created_time)}</div>
			</Space>
			<div className={style.bubble}>
				<ContentComponent content={message.content} />
			</div>
		</div>
	)
}

function UserComponent({ message }) {
	return (
		<div className={`${style['message-item']} ${style.right}`}>
			<Space className={style.sender}>
				<div>{formatDate(message.created_time)}</div>
				<Image
					width={30}
					src={UserHeader}
				/>
			</Space>
			<div className={style.bubble}>{message.content}</div>
		</div>
	)
}

export default function MessageItem({ message }) {
	return message.role === 'assistant' ? (
		<AssistantComponent message={message} />
	) : (
		<UserComponent message={message} />
	)
}
