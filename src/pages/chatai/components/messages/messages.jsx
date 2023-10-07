import { Space, Image, Alert } from 'antd'
import style from './index.module.less'
import MessageItem from './message-item'
import { getFileUrl } from '@/utils'

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
            <img
              src={getFileUrl('chatgpt-icon.svg')}
              style={{ width: 30 }}
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
