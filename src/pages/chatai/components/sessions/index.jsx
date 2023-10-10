import style from './index.module.less'
import { SessionList } from '@/database'
import { useState, useEffect } from 'react'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { getFileUrl } from '@/utils'
import AD from '../extends/ad'
import Support from '../extends/support'

export default function Sessions(props) {
  const sessionList = new SessionList()

  // 会话列表
  const [dataList, setDataList] = useState([])

  // 检查会话列表清单
  const getSessionList = async () => {
    const sessions = await sessionList.get()
    setDataList(sessions)
    props.onRefreshFinish()
  }

  useEffect(() => {
    props.refresh && getSessionList()
  }, [props.refresh])

  // 当前选择的会话
  const [current, setCurrent] = useState(null)
  const onCurrenChange = current => {
    setCurrent(current.id)
    props.onSessionChange(current.store_name)
  }

  // 删除会话
  const remove = async ({ id, store_name }) => {
    const res = await sessionList.removeData(id)
    if (res) {
      props.onRemoveSession(store_name)

      const index = dataList.findIndex(d => d.id === id)
      if (~index) {
        dataList.splice(index, 1)
        setDataList([...dataList])
      }
    }
  }

  const addSession = () => {
    setCurrent(null)
    props.onNewSession()
  }

  return (
    <div className={style.container}>
      <div
        className={style['btn-add']}
        onClick={() => !props.loading && addSession()}
      >
        <PlusOutlined />
        创建新的会话
      </div>
      <div className={style['scroll-list']}>
        {dataList?.map(d => (
          <div
            key={d.id}
            className={`${style['session-item']} ${
              d.id === current && style.focus
            }`}
            onClick={() => {
              !props.loading && onCurrenChange(d)
            }}
          >
            <div className={style['session-item-left']}>
              <img
                width={24}
                src={getFileUrl('message.svg')}
                style={{ marginRight: 4 }}
                alt=''
              />
              <div className={style['session-title']}>{d.title}</div>
            </div>
            <DeleteOutlined
              className={style.icon}
              onClick={event => {
                event.stopPropagation()
                !props.loading && remove(d)
              }}
            />
          </div>
        ))}
      </div>
      <Support />
      <AD />
    </div>
  )
}
