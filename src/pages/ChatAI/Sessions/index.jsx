import {SessionList} from '@/dataBase'
import {useState, useEffect} from 'react'
import styles from './index.module.less'
import MessageIcon from '@/assets/message.svg'
import {
	DeleteOutlined,
	CloseOutlined,
	PlusOutlined,
	CheckOutlined,
} from '@ant-design/icons'
import {Space} from 'antd'

export default function Sessions(props) {
	const sessionList = new SessionList()
	// 会话列表
	const [dataList, setDataList] = useState([])
	// 检查会话列表清单
	const getSessionList = async () => {
		const sessions = await sessionList.get()
		setDataList(sessions)
	}
	useEffect(() => {
		getSessionList()
	}, [])

	const [current, setCurrent] = useState(null)
	const onCurrenChange = current => {
		setCurrent(current.id)
		props.onSessionChange(current.store_name)
	}

	// 删除会话
	const remove = async ({id, store_name}) => {
		const res = await sessionList.removeData(id)
		if (res) {
			props.onRemoveSession(store_name)

			const _data = [...dataList]
			const index = _data.findIndex(d => d.id === id)

			if (~index) {
				_data.splice(index)
				setDataList(_data)
			}
		}
	}

	// 删除操作
	const [waiting, setWaiting] = useState(false)
	const confirmRemove = event => {
		event.stopPropagation()
		setWaiting(true)
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
			props.onNewSession(store_name)
		}
	}

	return (
		<div className={styles.container}>
			<div
				className={styles['btn-add']}
				onClick={addSession}
			>
				<PlusOutlined/>
				创建新的会话
			</div>
			{dataList?.map(d => (
				<div
					key={d.id}
					className={`${styles['session-item']} ${d.id === current && styles.focus}`}
					onClick={() => {
						onCurrenChange(d)
					}}
				>
					<div className={styles['session-item-left']}>
						<img
							width={24}
							src={MessageIcon}
							style={{marginRight: 4}}
							alt=''
						/>
						{d.title}
					</div>
					{
						d.id === current && (<>
							{waiting ? (
								<Space>
									<CloseOutlined
										className={styles.icon}
										onClick={event => {
											event.stopPropagation()
											setWaiting(false)
										}}
									/>
									<CheckOutlined
										className={styles.icon}
										onClick={event => {
											event.stopPropagation()
											remove(d)
										}}
									/>
								</Space>
							) : (
								<DeleteOutlined
									className={styles.icon}
									onClick={confirmRemove}
								/>
							)}
						</>)
					}
				</div>
			))}
		</div>
	)
}
