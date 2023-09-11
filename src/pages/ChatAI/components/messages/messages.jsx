import { Space, Image, Alert } from 'antd'
import style from './index.module.less'
import ChatGPTHeader from '@/assets/chatgpt-icon.svg'
import MessageItem from './message-item.jsx'

export default function Messages({ messages, loading, error }) {
  return (
    <div
      id='messages-box'
      className={style['messages-box']}
    >
      {messages.map(message => (
        <MessageItem
          key={message.id}
          message={message}
        />
      ))}

      {loading ? (
        <div className={style['message-item']}>
          <Space className={style.sender}>
            <Image
              width={30}
              src={ChatGPTHeader}
            />
          </Space>
          <div className={style.bubble}>
            <span className={style.cursor}>|</span>
          </div>
        </div>
      ) : null}
      {error ? (
        <Alert
          message={error}
          type='error'
          showIcon
        />
      ) : null}
    </div>
  )
}
