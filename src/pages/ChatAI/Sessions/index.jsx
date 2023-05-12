import { SessionList } from '@/dataBase'
import { useState, useEffect } from 'react'
import style from './index.module.less'
import MessageIcon from '@/assets/message.svg'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'

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

	const [current, setCurrent] = useState(null)
	const onCurrenChange = current => {
		setCurrent(current.id)
		props.onSessionChange(current.store_name)
	}

	const addSession = async () => {
		const store_name = `chat_${Date.now()}`
		const _data = {
			store_name,
			title: `新的会话${dataList.length + 1}`,
		}
		const res = await sessionList.addData(_data)

		if (res) {
			setDataList([...dataList, res])
			setCurrent(res.id)
			props.onNewSession(store_name)
		}
	}

	return (
		<div className={style.container}>
			<div
				className={style['btn-add']}
				onClick={addSession}
			>
				<PlusOutlined />
				创建新的会话
			</div>
			{dataList?.map(d => (
				<div
					key={d.id}
					className={`${style['session-item']} ${
						d.id === current && style.focus
					}`}
					onClick={() => {
						onCurrenChange(d)
					}}
				>
					<div className={style['session-item-left']}>
						<img
							width={24}
							src={MessageIcon}
							style={{ marginRight: 4 }}
							alt=''
						/>
						<div className={style['session-title']}>{d.title}</div>
					</div>
					<DeleteOutlined
						className={style.icon}
						onClick={event => {
							event.stopPropagation()
							remove(d)
						}}
					/>
				</div>
			))}
		</div>
	)
}
