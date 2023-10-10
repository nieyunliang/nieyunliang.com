import { Button, Modal } from 'antd'
import { UnlockOutlined, CheckCircleTwoTone } from '@ant-design/icons'
import { getFileUrl, getPlus, isPlus, formatDate } from '@/utils'
import { useBoolean, useRequest } from 'ahooks'
import { Input } from 'antd'
import { Space } from 'antd'
import { useRef } from 'react'
import { getVipState } from '@/utils/api'
import { message } from '@/utils/escapeantd'
import { ConfigProvider } from 'antd'
export default function Support() {
  const plus = getPlus()
  const [modalOpen, { setTrue, setFalse }] = useBoolean(false)

  const { runAsync: runOpen, loading } = useRequest(
    params => getVipState(params || plus?.account),
    {
      manual: !plus?.account,
      onSuccess: res => {
        if (res.data) {
          if (res.data.expire < Date.now()) {
            message.warning('您的PLUS服务过期啦！')
            return
          }
          localStorage.setItem('plus', JSON.stringify(res.data))
          window.location.reload()
        } else {
          message.warning('账号不存在')
        }
      }
    }
  )

  const inputRef = useRef()
  const handleOk = () => {
    const value = inputRef.current?.input?.value
    value && runOpen(value)
  }
  return (
    <>
      <div style={{ marginBottom: 4, textAlign: 'center' }}>
        <a
          href='https://github.com/nieyunliang/nieyunliang.com/issues'
          target='_blank'
        >
          <img
            src={getFileUrl('github.svg')}
            style={{ width: 30 }}
          />
        </a>
      </div>
      {isPlus() ? (
        <>
          <ConfigProvider theme={{ token: { colorPrimary: '#8902ea' } }}>
            <Button type='primary'>
              <img
                src={getFileUrl('vip.svg')}
                style={{ width: 20 }}
              />
              <span style={{ verticalAlign: 'top' }}>已升级PLUS</span>
            </Button>
          </ConfigProvider>
          <p
            style={{
              marginTop: 6,
              color: '#eee',
              textAlign: 'center',
              fontSize: 12
            }}
          >
            PLUS到期时间：{plus?.expire ? formatDate(plus.expire) : ''}
          </p>
        </>
      ) : (
        <Button
          type='primary'
          ghost
          onClick={setTrue}
        >
          升级PLUS <UnlockOutlined />
        </Button>
      )}

      <Modal
        forceRender
        closeIcon={false}
        title='升级 PLUS 提示'
        open={modalOpen}
        okButtonProps={{ loading }}
        cancelText='取消'
        okText='确定'
        onCancel={setFalse}
        onOk={handleOk}
      >
        <Space direction='vertical'>
          <p>
            <CheckCircleTwoTone twoToneColor='#11a37f' /> 访问最强大的模型 GPT-4
          </p>
          <p>
            <CheckCircleTwoTone twoToneColor='#11a37f' /> 更快的响应速度
          </p>
          <p>
            <CheckCircleTwoTone twoToneColor='#11a37f' /> 更强大的推理能力
          </p>
          <p>有付费意愿的同学，可以通过掘金私信开通账号，月付￥20</p>
          <p>
            <a
              href='https://juejin.cn/user/553809590105117'
              target='_blank'
              rel='noopener noreferrer'
            >
              访问掘金私信
            </a>
          </p>
          <Input
            ref={inputRef}
            placeholder='填写您开通的账号，开始使用GPT-4'
          />
        </Space>
      </Modal>
    </>
  )
}
